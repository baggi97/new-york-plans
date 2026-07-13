import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'itinerary';

interface ChecklistData {
  checked: string[];
  skipped: string[];
  moved: Record<string, number>;
}

function parseStored(raw: string | null): ChecklistData {
  if (!raw) return { checked: [], skipped: [], moved: {} };
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { checked: parsed, skipped: [], moved: {} };
  return { checked: parsed.checked ?? [], skipped: parsed.skipped ?? [], moved: parsed.moved ?? {} };
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

    const migrated = await store.get('__checklist-migration-done');
    if (!migrated) {
      const legacyRaw = await store.get('checklist');
      if (legacyRaw) {
        const legacy = parseStored(legacyRaw);
        const current = parseStored(await store.get('checklist-new-york-2026'));
        const mergedChecked = [...new Set([...current.checked, ...legacy.checked])];
        const mergedSkipped = [...new Set([...current.skipped, ...legacy.skipped])];
        const merged = JSON.stringify({ checked: mergedChecked, skipped: mergedSkipped });
        await store.set('checklist-new-york-2026', merged);
        await store.delete('checklist');
      }
      await store.delete('checklist-barcelona-2026');
      await store.set('__checklist-migration-done', 'true');
      raw = await store.get(blobKey);
    }

    const data = parseStored(raw);
    return new Response(JSON.stringify(data), { status: 200, headers });
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json();
      let data: ChecklistData;
      if (Array.isArray(body)) {
        data = { checked: body, skipped: [], moved: {} };
      } else {
        data = { checked: body.checked ?? [], skipped: body.skipped ?? [], moved: body.moved ?? {} };
      }
      await store.set(blobKey, JSON.stringify(data));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
