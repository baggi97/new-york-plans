import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

interface JournalEntry {
  id: string;
  dayId: number;
  imageData: string;
  caption: string;
  timestamp: number;
}

const STORE_NAME = 'journal-photos';

function getIndexKey(req: Request): string {
  const url = new URL(req.url);
  const tripId = url.searchParams.get('tripId') || 'default';
  return `__index-${tripId}`;
}

async function getIndex(store: ReturnType<typeof getStore>, key: string): Promise<string[]> {
  const raw = await store.get(key);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function setIndex(store: ReturnType<typeof getStore>, key: string, ids: string[]) {
  await store.set(key, JSON.stringify(ids));
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const store = getStore(STORE_NAME);
  const headers = { 'Content-Type': 'application/json' };
  const indexKey = getIndexKey(req);

  if (req.method === 'GET') {
    let ids = await getIndex(store, indexKey);

    if (indexKey !== '__index') {
      const legacyIds = await getIndex(store, '__index');
      if (legacyIds.length > 0) {
        const existing = new Set(ids);
        const missing = legacyIds.filter(id => !existing.has(id));
        if (missing.length > 0) {
          ids = [...ids, ...missing];
          await setIndex(store, indexKey, ids);
          await setIndex(store, '__index', []);
        }
      }
    }

    const entries: JournalEntry[] = [];
    for (const id of ids) {
      const raw = await store.get(id);
      if (raw) {
        try { entries.push(JSON.parse(raw)); } catch { /* skip corrupt */ }
      }
    }

    return new Response(JSON.stringify(entries), { status: 200, headers });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { dayId, imageData, caption, id: existingId } = body;

      if (existingId) {
        const raw = await store.get(existingId);
        if (!raw) {
          return new Response(JSON.stringify({ error: 'Entry not found' }), { status: 404, headers });
        }
        const entry: JournalEntry = JSON.parse(raw);
        entry.caption = caption ?? entry.caption;
        await store.set(existingId, JSON.stringify(entry));
        return new Response(JSON.stringify(entry), { status: 200, headers });
      }

      if (!imageData || dayId == null) {
        return new Response(JSON.stringify({ error: 'dayId and imageData required' }), { status: 400, headers });
      }

      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        dayId,
        imageData,
        caption: caption || '',
        timestamp: Date.now(),
      };

      await store.set(entry.id, JSON.stringify(entry));
      const ids = await getIndex(store, indexKey);
      ids.push(entry.id);
      await setIndex(store, indexKey, ids);

      return new Response(JSON.stringify(entry), { status: 201, headers });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'id parameter required' }), { status: 400, headers });
    }

    await store.delete(id);
    const ids = await getIndex(store, indexKey);
    const filtered = ids.filter(i => i !== id);
    await setIndex(store, indexKey, filtered);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  return new Response('Method not allowed', { status: 405 });
};
