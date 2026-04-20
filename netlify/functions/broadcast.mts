import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_SECRET } = process.env;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT || !PUSH_SECRET) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { title, body, secret } = await req.json();

    if (!secret || secret !== PUSH_SECRET) {
      return new Response(JSON.stringify({ error: 'Forkert kode' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'Titel og besked er påkrævet' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const subsStore = getStore('push-subs');
    const { blobs: subEntries } = await subsStore.list();

    if (subEntries.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'Ingen subscribers' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({ title, body });
    let sent = 0;
    let failed = 0;

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
        }
        failed++;
      }
    }

    return new Response(JSON.stringify({ sent, failed }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Ugyldig request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
