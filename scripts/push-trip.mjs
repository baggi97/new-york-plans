#!/usr/bin/env node
// Push trip data from src/app/data/*-data.ts into the Netlify Blobs trip store.
//
// The app seeds trips into the store only once (when it's empty); after that the
// store is the source of truth, so edits to the *-data.ts files must be pushed
// here to take effect.
//
// Usage:
//   npm run push-trip                      # push all trips to local dev (:8888)
//   npm run push-trip -- barcelona-2026    # push only one trip (by id)
//   npm run push-trip -- --url=https://<site>.netlify.app
//   PUSH_URL=https://<site>.netlify.app ACCESS_SECRET=<prod-secret> npm run push-trip
//
// Auth: the /trips function sits behind the edge auth gate when ACCESS_SECRET is
// set, so this signs a short-lived admin cookie with the same HMAC scheme.
// The secret is read from --secret=, then $ACCESS_SECRET, then the local .env file.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(fileURLToPath(import.meta.url), '../..');
const DATA_DIR = path.join(REPO, 'src/app/data');

const args = process.argv.slice(2);
const flag = (name) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : undefined;
};
const idFilter = args.find((x) => !x.startsWith('--'));

const url = (flag('url') || process.env.PUSH_URL || 'http://localhost:8888').replace(/\/$/, '');
const endpoint = `${url}/.netlify/functions/trips`;

function readSecret() {
  if (flag('secret')) return flag('secret');
  if (process.env.ACCESS_SECRET) return process.env.ACCESS_SECRET;
  try {
    const env = fs.readFileSync(path.join(REPO, '.env'), 'utf8');
    const m = env.match(/^ACCESS_SECRET=(.+)$/m);
    if (m) return m[1].trim();
  } catch { /* no .env */ }
  return '';
}

function makeCookie(secret) {
  if (!secret) return undefined; // auth gate disabled
  const payload = 'local-admin:*';
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `travel_access=${payload}.${sig}`;
}

async function loadTrip(file) {
  let src = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
  src = src
    .split('\n')
    .filter((l) => !l.startsWith('import '))
    .join('\n')
    .replace(/export const \w+: TripData =/, 'export default');
  const tmp = path.join(os.tmpdir(), `push-${file}.mjs`);
  fs.writeFileSync(tmp, src);
  const mod = await import(pathToFileURL(tmp).href);
  fs.rmSync(tmp, { force: true });
  return mod.default;
}

async function main() {
  const cookie = makeCookie(readSecret());
  const headers = { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) };

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('-data.ts'));
  let trips = await Promise.all(files.map(loadTrip));
  if (idFilter) trips = trips.filter((t) => t.id === idFilter);

  if (trips.length === 0) {
    console.error(idFilter ? `No trip with id "${idFilter}" found in ${DATA_DIR}` : `No *-data.ts files in ${DATA_DIR}`);
    process.exit(1);
  }

  console.log(`Pushing ${trips.length} trip(s) to ${endpoint}\n`);

  for (const trip of trips) {
    const res = await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify(trip) });
    const body = await res.text();
    if (!res.ok) {
      console.error(`  ✗ ${trip.id}: ${res.status} ${body.slice(0, 120)}`);
      if (res.status === 403) {
        console.error('    (auth gate rejected the request — check ACCESS_SECRET matches the target)');
      }
      process.exitCode = 1;
      continue;
    }
    const bookings = trip.days.flatMap((d) => d.bookings.map((b) => `${d.date}: ${b.label} @ ${b.time ?? '—'}`));
    console.log(`  ✓ ${trip.id} (${trip.title}) — ${trip.days.length} days, ${bookings.length} booking(s)`);
    for (const b of bookings) console.log(`      ${b}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
