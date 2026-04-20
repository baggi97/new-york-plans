import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const AERO_BASE = 'https://aeroapi.flightaware.com/aeroapi';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedFlight {
  data: unknown;
  ts: number;
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const ident = url.searchParams.get('ident');
  if (!ident) {
    return new Response(JSON.stringify({ error: 'Missing ident param' }), { status: 400 });
  }

  const apiKey = Netlify.env.get('FLIGHTAWARE_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Flight API not configured' }), { status: 503 });
  }

  const store = getStore('flight-cache');
  const cacheKey = ident.toUpperCase();

  try {
    const cached = await store.get(cacheKey, { type: 'json' }) as CachedFlight | null;
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cached.data), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=300' },
      });
    }
  } catch { /* no cache */ }

  try {
    const res = await fetch(`${AERO_BASE}/flights/${cacheKey}`, {
      headers: { 'x-apikey': apiKey },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'FlightAware API error', status: res.status }), {
        status: 502,
      });
    }

    const data = await res.json();

    const flights = (data.flights || []).map((f: any) => ({
      ident: f.ident,
      status: f.status,
      origin: { code: f.origin?.code_iata, city: f.origin?.city, gate: f.origin?.gate },
      destination: { code: f.destination?.code_iata, city: f.destination?.city, gate: f.destination?.gate, terminal: f.destination?.terminal },
      scheduledDeparture: f.scheduled_off,
      estimatedDeparture: f.estimated_off,
      actualDeparture: f.actual_off,
      scheduledArrival: f.scheduled_on,
      estimatedArrival: f.estimated_on,
      actualArrival: f.actual_on,
      progressPercent: f.progress_percent,
    }));

    await store.setJSON(cacheKey, { data: flights, ts: Date.now() });

    return new Response(JSON.stringify(flights), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=300' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Fetch failed' }), { status: 502 });
  }
};
