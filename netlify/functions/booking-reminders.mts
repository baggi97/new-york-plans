import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

// Scheduled: sends a push ~LEAD_MIN before each booking that has a `time`.
// Runs every 15 min; de-duped per booking so each reminder fires once.
const LEAD_MIN = 90;

// Convert a wall-clock local time string (e.g. "2026-07-28T10:00") in a given
// IANA timezone to a UTC Date.
function zonedToUtc(local: string, tz: string): Date {
  const guess = new Date(local + 'Z'); // treat wall time as if it were UTC
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(guess)) p[part.type] = part.value;
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  const offset = asUTC - guess.getTime();
  return new Date(guess.getTime() - offset);
}

export default async () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) return;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const trips = getStore('trips');
  const sentStore = getStore('booking-reminders');
  const subsStore = getStore('push-subs');

  const idxRaw = await trips.get('__index');
  if (!idxRaw) return;
  let index: { id: string }[];
  try { index = JSON.parse(idxRaw); } catch { return; }

  const now = Date.now();
  const due: { key: string; title: string; body: string }[] = [];

  for (const meta of index) {
    const raw = await trips.get(meta.id);
    if (!raw) continue;
    let trip: any;
    try { trip = JSON.parse(raw); } catch { continue; }
    const tz = trip.destination?.timezone || 'Europe/Madrid';

    for (const day of trip.days || []) {
      for (const b of day.bookings || []) {
        if (!b.time) continue;
        const when = zonedToUtc(b.time, tz).getTime();
        const lead = when - LEAD_MIN * 60_000;
        if (now < lead || now >= when) continue; // outside the reminder window

        const key = `${trip.id}::${b.label}::${b.time}`;
        if (await sentStore.get(key)) continue; // already reminded

        const mins = Math.max(1, Math.round((when - now) / 60_000));
        const hhmm = String(b.time).slice(11, 16);
        due.push({
          key,
          title: `⏰ Snart: ${b.label}`,
          body: `${b.label} kl. ${hhmm} — om ~${mins} min. Vær klar i god tid.`,
        });
      }
    }
  }

  if (due.length === 0) return;

  const { blobs } = await subsStore.list();
  for (const rem of due) {
    const payload = JSON.stringify({ title: rem.title, body: rem.body, url: '/' });
    for (const entry of blobs) {
      try {
        const sj = await subsStore.get(entry.key);
        if (!sj) continue;
        await webpush.sendNotification(JSON.parse(sj), payload);
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) await subsStore.delete(entry.key);
      }
    }
    await sentStore.set(rem.key, String(now));
  }
};

export const config: Config = { schedule: '*/15 * * * *' };
