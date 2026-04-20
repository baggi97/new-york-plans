import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return new Response('Invalid subscription', { status: 400 });
    }

    const store = getStore('push-subs');
    const key = btoa(subscription.endpoint).replace(/[/+=]/g, '_');
    await store.set(key, JSON.stringify(subscription));

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('Server error', { status: 500 });
  }
};
