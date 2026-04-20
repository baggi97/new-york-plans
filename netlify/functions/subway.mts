import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const ALERTS_URL = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys/all-alerts.json';
const CACHE_TTL_MS = 2 * 60 * 1000;
const RELEVANT_ROUTES = new Set(['N', 'R', 'W', '7', 'A', 'C', 'E', '1', '2', '3']);

interface CachedAlerts {
  data: unknown;
  ts: number;
}

export default async (_req: Request, _context: Context) => {
  const store = getStore('subway-cache');

  try {
    const cached = await store.get('alerts', { type: 'json' }) as CachedAlerts | null;
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cached.data), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=120' },
      });
    }
  } catch { /* no cache */ }

  try {
    const res = await fetch(ALERTS_URL);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'MTA API error' }), { status: 502 });
    }

    const feed = await res.json();
    const entities = feed.entity || [];

    const alerts: { id: string; routes: string[]; title: string; description: string; severity: string }[] = [];

    for (const entity of entities) {
      const alert = entity.alert;
      if (!alert) continue;

      const routes: string[] = [];
      for (const ie of alert.informed_entity || []) {
        if (ie.route_id && RELEVANT_ROUTES.has(ie.route_id)) {
          routes.push(ie.route_id);
        }
      }
      if (routes.length === 0) continue;

      const headerText = alert.header_text?.translation?.[0]?.text || '';
      const descText = alert.description_text?.translation?.[0]?.text || '';
      const severity = alert.severity_level || 'INFO';

      alerts.push({
        id: entity.id,
        routes: [...new Set(routes)],
        title: headerText,
        description: descText.slice(0, 300),
        severity,
      });
    }

    await store.setJSON('alerts', { data: alerts, ts: Date.now() });

    return new Response(JSON.stringify(alerts), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=120' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Fetch failed' }), { status: 502 });
  }
};
