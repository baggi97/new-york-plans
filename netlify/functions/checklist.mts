import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'itinerary';
const BLOB_KEY = 'checklist';

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const store = getStore(STORE_NAME);
  const headers = { 'Content-Type': 'application/json' };

  if (req.method === 'GET') {
    const raw = await store.get(BLOB_KEY);
    const items: string[] = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify(items), { status: 200, headers });
  }

  if (req.method === 'PUT') {
    try {
      const items: string[] = await req.json();
      if (!Array.isArray(items)) {
        return new Response(JSON.stringify({ error: 'Expected string array' }), { status: 400, headers });
      }
      await store.set(BLOB_KEY, JSON.stringify(items));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
