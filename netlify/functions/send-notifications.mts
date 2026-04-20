import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

interface TripNotification {
  id: string;
  date: string;        // UTC date when the cron fires
  sendUtcHour: number; // UTC hour to match
  title: string;
  body: string;
  url: string;         // Deep link path for notificationclick
}

const NOTIFICATIONS: TripNotification[] = [
  // Aften d. 20-21 apr: kl. 21:00 dansk tid (CEST) = 19:00 UTC
  { id: 'eve-0420', date: '2026-04-20', sendUtcHour: 19, title: 'Om 2 dage!', body: 'I overmorgen letter SAS SK909 mod New York. Tjek pakkelisten og glæd dig — snart står I i Times Square!', url: '/#praktisk' },
  { id: 'eve-0421', date: '2026-04-21', sendUtcHour: 19, title: 'Klar til New York?', body: 'Tjek pakkelisten og hav boardingpass klar. SAS SK909 afgår i morgen kl. 10:25. Husk pas, GoCity-app og komfortable sko!', url: '/#praktisk' },
  // Aften d. 22-26 apr: kl. 22:00 NY-tid (EDT) = 02:00 UTC næste dag
  { id: 'eve-0422', date: '2026-04-23', sendUtcHour: 2, title: 'I morgen: DUMBO, Brooklyn Bridge og 9/11', body: 'Start i DUMBO med udsigt til Manhattan Bridge. Gå over Brooklyn Bridge, besøg 9/11 Museum (husk GoCity) og afslut med Mets-kamp på Citi Field. ~14 km', url: '/#dag-2' },
  { id: 'eve-0423', date: '2026-04-24', sendUtcHour: 2, title: 'I morgen: Central Park og Top of the Rock', body: 'Morgenmad på Ess-a-Bagel, derefter Central Park (Bethesda Fountain, Bow Bridge). Roosevelt Island Tram om eftermiddagen. Top of the Rock kl. 19 — perfekt til solnedgang', url: '/#dag-3' },
  { id: 'eve-0424', date: '2026-04-25', sendUtcHour: 2, title: 'I morgen: Chinatown, SoHo og DUMBO', body: "Brunch på Bubby's, så Chinatown og Little Italy. Katz's Delicatessen til frokost (bestil ved disken — mist IKKE din billet!). SoHo-shopping og afslut i DUMBO ved solnedgang", url: '/#dag-4' },
  { id: 'eve-0425', date: '2026-04-26', sendUtcHour: 2, title: 'I morgen: Midtown og Empire State', body: 'Grand Central Terminal, Fifth Avenue, High Line og Chelsea Market. Empire State Building kl. 21:15 — magisk udsigt om aftenen. ~12 km', url: '/#dag-5' },
  { id: 'eve-0426', date: '2026-04-27', sendUtcHour: 2, title: 'Sidste morgen i NYC', body: 'Pak i aften så morgenen er stressfri. Sunday brunch, sidste gåtur, så Penn Station til Newark. Vær i lufthavnen senest kl. 14:15. SAS SK910 kl. 17:15', url: '/#dag-6' },
  // Morgen: kl. 05:00 NY-tid (EDT) = 09:00 UTC
  { id: 'morn-0422', date: '2026-04-22', sendUtcHour: 9, title: 'God rejse!', body: 'SAS SK909 lander i Newark ca. 14:55. Tag AirTrain + NJ Transit til Penn Station (~1 time). Check-in på Millennium Hotel og nyd Times Square i aftenlyset', url: '/#dag-1' },
  { id: 'morn-0423', date: '2026-04-23', sendUtcHour: 9, title: 'God morgen, dag 2!', body: 'Subway N/R til DUMBO for Manhattan Bridge-udsigten. Gå over Brooklyn Bridge og besøg 9/11 Museum. I aften: Mets på Citi Field — tag 7-toget fra Times Sq', url: '/#dag-2' },
  { id: 'morn-0424', date: '2026-04-24', sendUtcHour: 9, title: 'God morgen, dag 3!', body: 'Ess-a-Bagel til morgenmad, derefter Central Park. Prøv Roosevelt Island Tram — fantastisk udsigt! Husk Top of the Rock kl. 19', url: '/#dag-3' },
  { id: 'morn-0425', date: '2026-04-25', sendUtcHour: 9, title: 'God morgen, dag 4!', body: "Bubby's i TriBeCa venter med brunch! Derefter Chinatown, Katz's og SoHo. Afslut i DUMBO med Brooklyn Bridge-udsigt", url: '/#dag-4' },
  { id: 'morn-0426', date: '2026-04-26', sendUtcHour: 9, title: 'God morgen, dag 5!', body: 'Grand Central Terminal og Fifth Avenue i dag. Slut af med High Line og Chelsea Market. Empire State Building kl. 21:15 — tag kameraet med!', url: '/#dag-5' },
  { id: 'morn-0427', date: '2026-04-27', sendUtcHour: 9, title: 'Sidste dag!', body: 'Nyd brunch på Sunday Morning. Pak de sidste ting og tag NJ Transit + AirTrain til Newark. SAS SK910 afgår kl. 17:15 — vær der senest kl. 14:15', url: '/#dag-6' },
];

function getUtcTime(): { date: string; hour: number } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return { date: `${y}-${m}-${d}`, hour: now.getUTCHours() };
}

export default async () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    console.log('Missing VAPID env vars');
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { date, hour } = getUtcTime();
  const sentStore = getStore('push-sent');
  const subsStore = getStore('push-subs');

  const pending: TripNotification[] = [];
  for (const n of NOTIFICATIONS) {
    if (n.date === date && hour === n.sendUtcHour) {
      const alreadySent = await sentStore.get(n.id);
      if (!alreadySent) pending.push(n);
    }
  }

  if (pending.length === 0) {
    console.log(`No notifications to send (UTC: ${date} ${hour}:00)`);
    return;
  }

  const { blobs: subEntries } = await subsStore.list();
  if (subEntries.length === 0) {
    console.log('No subscriptions registered');
    return;
  }

  for (const n of pending) {
    const payload = JSON.stringify({ title: n.title, body: n.body, url: n.url });
    let sent = 0;

    for (const entry of subEntries) {
      try {
        const subJson = await subsStore.get(entry.key);
        if (!subJson) continue;
        const subscription = JSON.parse(subJson);
        await webpush.sendNotification(subscription, payload);
        sent++;
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await subsStore.delete(entry.key);
          console.log(`Removed expired subscription: ${entry.key}`);
        } else {
          console.error(`Push failed for ${entry.key}:`, err?.message);
        }
      }
    }

    await sentStore.set(n.id, new Date().toISOString());
    console.log(`Sent "${n.title}" to ${sent} subscriber(s)`);
  }
};

export const config: Config = {
  schedule: '0 2,9,19 * * *',
};
