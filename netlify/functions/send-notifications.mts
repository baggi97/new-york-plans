import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

interface TripNotification {
  id: string;
  date: string;
  sendHour: number;
  title: string;
  body: string;
}

const NOTIFICATIONS: TripNotification[] = [
  // Aften kl. 22 NY-tid
  { id: 'eve-0421', date: '2026-04-21', sendHour: 22, title: 'Klar til New York?', body: 'Tjek pakkelisten og hav boardingpass klar. SAS SK909 afgår i morgen!' },
  { id: 'eve-0422', date: '2026-04-22', sendHour: 22, title: 'I morgen: Brooklyn + 9/11', body: 'Husk GoCity-appen til 9/11 Museum' },
  { id: 'eve-0423', date: '2026-04-23', sendHour: 22, title: 'I morgen: Central Park + Top of the Rock', body: 'Top of the Rock er booket kl. 19 — perfekt til solnedgang' },
  { id: 'eve-0424', date: '2026-04-24', sendHour: 22, title: 'I morgen: Chinatown + SoHo + DUMBO', body: "Katz's: Bestil ved disken og mist IKKE din billet!" },
  { id: 'eve-0425', date: '2026-04-25', sendHour: 22, title: 'I morgen: Midtown + Empire State', body: 'Empire State Building kl. 21:15 — magisk udsigt over byen om aftenen' },
  { id: 'eve-0426', date: '2026-04-26', sendHour: 22, title: 'Sidste morgen i NYC', body: 'Pak aftenen før så morgenen er stressfri. Vær i lufthavnen senest kl. 14:15' },
  // Morgen kl. 5 NY-tid
  { id: 'morn-0422', date: '2026-04-22', sendHour: 5, title: 'God rejse!', body: 'SAS SK909 lander i Newark ca. 14:55' },
  { id: 'morn-0423', date: '2026-04-23', sendHour: 5, title: 'God morgen, dag 2!', body: 'Start med subway til DUMBO og nyd Manhattan Bridge-udsigten' },
  { id: 'morn-0424', date: '2026-04-24', sendHour: 5, title: 'God morgen, dag 3!', body: 'Ess-a-Bagel eller H&H Bagels til morgenmad, derefter Central Park' },
  { id: 'morn-0425', date: '2026-04-25', sendHour: 5, title: 'God morgen, dag 4!', body: "Bubby's i TriBeCa venter med brunch!" },
  { id: 'morn-0426', date: '2026-04-26', sendHour: 5, title: 'God morgen, dag 5!', body: 'Grand Central Terminal og Fifth Avenue i dag' },
  { id: 'morn-0427', date: '2026-04-27', sendHour: 5, title: 'Sidste dag!', body: 'Nyd Sunday Morning brunch. Penn Station → Newark med NJ Transit + AirTrain' },
];

function getNYTime(): { date: string; hour: number } {
  const now = new Date();
  const nyDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
  const nyHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric', hour12: false,
    }).format(now),
    10,
  );
  return { date: nyDate, hour: nyHour };
}

export default async () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    console.log('Missing VAPID env vars');
    return;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { date, hour } = getNYTime();
  const sentStore = getStore('push-sent');
  const subsStore = getStore('push-subs');

  const pending: TripNotification[] = [];
  for (const n of NOTIFICATIONS) {
    if (n.date === date && hour === n.sendHour) {
      const alreadySent = await sentStore.get(n.id);
      if (!alreadySent) pending.push(n);
    }
  }

  if (pending.length === 0) {
    console.log(`No notifications to send (NY: ${date} ${hour}:00)`);
    return;
  }

  const { blobs: subEntries } = await subsStore.list();
  if (subEntries.length === 0) {
    console.log('No subscriptions registered');
    return;
  }

  for (const n of pending) {
    const payload = JSON.stringify({ title: n.title, body: n.body });
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
  schedule: '0 2,9 * * *',
};
