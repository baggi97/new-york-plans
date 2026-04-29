import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'itinerary';

interface ChecklistData {
  checked: string[];
  skipped: string[];
}

function parseStored(raw: string | null): ChecklistData {
  if (!raw) return { checked: [], skipped: [] };
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { checked: parsed, skipped: [] };
  return { checked: parsed.checked ?? [], skipped: parsed.skipped ?? [] };
}

function getBlobKey(req: Request): string {
  const url = new URL(req.url);
  const tripId = url.searchParams.get('tripId') || 'default';
  return `checklist-${tripId}`;
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const store = getStore(STORE_NAME);
  const headers = { 'Content-Type': 'application/json' };
  const blobKey = getBlobKey(req);

  if (req.method === 'GET') {
    let raw = await store.get(blobKey);

    if (blobKey !== 'checklist') {
      const legacyRaw = await store.get('checklist');
      if (legacyRaw) {
        const legacy = parseStored(legacyRaw);
        const current = parseStored(raw);
        const mergedChecked = [...new Set([...current.checked, ...legacy.checked])];
        const mergedSkipped = [...new Set([...current.skipped, ...legacy.skipped])];
        if (mergedChecked.length > current.checked.length || mergedSkipped.length > current.skipped.length) {
          const merged = JSON.stringify({ checked: mergedChecked, skipped: mergedSkipped });
          await store.set(blobKey, merged);
          await store.delete('checklist');
          raw = merged;
        }
      }
    }

    const data = parseStored(raw);
    return new Response(JSON.stringify(data), { status: 200, headers });
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json();
      let data: ChecklistData;
      if (Array.isArray(body)) {
        data = { checked: body, skipped: [] };
      } else {
        data = { checked: body.checked ?? [], skipped: body.skipped ?? [] };
      }
      await store.set(blobKey, JSON.stringify(data));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
