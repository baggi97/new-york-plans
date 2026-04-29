import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'itinerary';
const BLOB_KEY = 'checklist';

interface ChecklistData {
  checked: string[];
  skipped: string[];
}

function parseStored(raw: string | null): ChecklistData {
  if (!raw) return { checked: [], skipped: [] };
  const parsed = JSON.parse(raw);
  // Backward compat: old format was a plain string array (checked only)
  if (Array.isArray(parsed)) return { checked: parsed, skipped: [] };
  return { checked: parsed.checked ?? [], skipped: parsed.skipped ?? [] };
}

export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const store = getStore(STORE_NAME);
  const headers = { 'Content-Type': 'application/json' };

  if (req.method === 'GET') {
    const raw = await store.get(BLOB_KEY);
    const data = parseStored(raw);
    return new Response(JSON.stringify(data), { status: 200, headers });
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json();
      // Accept both old format (plain array) and new format ({checked, skipped})
      let data: ChecklistData;
      if (Array.isArray(body)) {
        data = { checked: body, skipped: [] };
      } else {
        data = { checked: body.checked ?? [], skipped: body.skipped ?? [] };
      }
      await store.set(BLOB_KEY, JSON.stringify(data));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
