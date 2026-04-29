import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'trips';
const INDEX_KEY = '__index';

interface TripMeta {
  id: string;
  title: string;
  city: string;
  dates: string;
}

async function getIndex(store: ReturnType<typeof getStore>): Promise<TripMeta[]> {
  const raw = await store.get(INDEX_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function setIndex(store: ReturnType<typeof getStore>, index: TripMeta[]) {
  await store.set(INDEX_KEY, JSON.stringify(index));
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const store = getStore(STORE_NAME);
  const headers = { 'Content-Type': 'application/json' };
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (req.method === 'GET') {
    if (id) {
      const raw = await store.get(id);
      if (!raw) return new Response(JSON.stringify({ error: 'Trip not found' }), { status: 404, headers });
      return new Response(raw, { status: 200, headers });
    }
    const index = await getIndex(store);
    return new Response(JSON.stringify(index), { status: 200, headers });
  }

  if (req.method === 'PUT') {
    try {
      const trip = await req.json();
      if (!trip.id) return new Response(JSON.stringify({ error: 'Trip id required' }), { status: 400, headers });
      await store.set(trip.id, JSON.stringify(trip));
      const index = await getIndex(store);
      const existing = index.findIndex(t => t.id === trip.id);
      const meta: TripMeta = {
        id: trip.id,
        title: trip.title ?? '',
        city: trip.destination?.city ?? '',
        dates: trip.dates ?? '',
      };
      if (existing >= 0) {
        index[existing] = meta;
      } else {
        index.push(meta);
      }
      await setIndex(store, index);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }
  }

  if (req.method === 'DELETE') {
    if (!id) return new Response(JSON.stringify({ error: 'id parameter required' }), { status: 400, headers });
    await store.delete(id);
    const index = await getIndex(store);
    await setIndex(store, index.filter(t => t.id !== id));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response('Method not allowed', { status: 405 });
};
