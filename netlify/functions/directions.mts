import type { Context } from '@netlify/functions';

interface TransitStep {
  line: string;
  color: string;
  departure: string;
  arrival: string;
  stops: number;
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const originLat = url.searchParams.get('olat');
  const originLng = url.searchParams.get('olng');
  const destLat = url.searchParams.get('dlat');
  const destLng = url.searchParams.get('dlng');

  if (!originLat || !originLng || !destLat || !destLng) {
    return new Response(JSON.stringify({ error: 'Missing coordinates' }), { status: 400 });
  }

  const apiKey = Netlify.env.get('GOOGLE_ROUTES_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Google Routes API not configured' }), { status: 503 });
  }

  try {
    const body = {
      origin: { location: { latLng: { latitude: +originLat, longitude: +originLng } } },
      destination: { location: { latLng: { latitude: +destLat, longitude: +destLng } } },
      travelMode: 'TRANSIT',
      computeAlternativeRoutes: false,
      languageCode: 'da',
    };

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.polyline.encodedPolyline,routes.legs.steps.transitDetails,routes.legs.steps.travelMode',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Google API error', detail: err }), { status: 502 });
    }

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) {
      return new Response(JSON.stringify({ error: 'No transit route found' }), { status: 404 });
    }

    const durationSec = parseInt(route.duration?.replace('s', '') || '0', 10);
    const distanceM = route.distanceMeters || 0;
    const encoded = route.polyline?.encodedPolyline || '';

    const transitSteps: TransitStep[] = [];
    const segments: { mode: string; geojson: any; color?: string; line?: string }[] = [];

    for (const leg of route.legs || []) {
      for (const step of leg.steps || []) {
        const stepPoly = step.polyline?.encodedPolyline;
        if (step.travelMode === 'TRANSIT' && step.transitDetails) {
          const td = step.transitDetails;
          const tl = td.transitLine;
          const lineName = tl?.nameShort || tl?.name || '';
          const lineColor = tl?.color || '#808080';
          transitSteps.push({
            line: lineName,
            color: lineColor,
            departure: td.stopDetails?.departureStop?.name || '',
            arrival: td.stopDetails?.arrivalStop?.name || '',
            stops: td.stopCount || 0,
          });
          if (stepPoly) {
            segments.push({ mode: 'TRANSIT', geojson: decodePolyline(stepPoly), color: lineColor, line: lineName });
          }
        } else if (step.travelMode === 'WALK' && stepPoly) {
          segments.push({ mode: 'WALK', geojson: decodePolyline(stepPoly) });
        }
      }
    }

    const geojson = decodePolyline(encoded);

    return new Response(JSON.stringify({
      durationSec,
      distanceM,
      transitSteps,
      segments,
      geojson,
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=300' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Fetch failed' }), { status: 502 });
  }
};

function decodePolyline(encoded: string): { type: 'LineString'; coordinates: number[][] } {
  const coords: number[][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lng / 1e5, lat / 1e5]);
  }

  return { type: 'LineString', coordinates: coords };
}
