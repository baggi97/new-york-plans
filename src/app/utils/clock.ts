// Mockable "now" for testing how the app behaves before/during/after a trip.
//
// Activate by loading the app with a `?mock=` query param, e.g.
//   /?mock=2026-07-28T10:30        -> pretend it's day 2 of the Barcelona trip
//   /?mock=off                     -> clear the override
// or from the browser console: setMockDate('2026-07-28T10:30') / clearMockDate().
//
// When set, time still advances in real time from the mocked base (so clocks
// tick and countdowns update). With no override, this is just the real clock.

const LS_KEY = 'travel-mock-now';

let offset = 0;
let initialized = false;

function init(): void {
  if (initialized) return;
  initialized = true;
  try {
    const params = new URLSearchParams(location.search);
    if (params.has('mock')) {
      const v = params.get('mock');
      if (!v || v === 'off' || v === 'clear') localStorage.removeItem(LS_KEY);
      else localStorage.setItem(LS_KEY, v);
    }
    const stored = localStorage.getItem(LS_KEY);
    const base = stored ? new Date(stored).getTime() : NaN;
    offset = !isNaN(base) ? base - Date.now() : 0;
  } catch {
    offset = 0;
  }
}

export function nowMs(): number {
  init();
  return Date.now() + offset;
}

export function now(): Date {
  return new Date(nowMs());
}

export function isMocked(): boolean {
  init();
  return offset !== 0;
}

export function setMockDate(iso: string): void {
  localStorage.setItem(LS_KEY, iso);
  location.reload();
}

export function clearMockDate(): void {
  localStorage.removeItem(LS_KEY);
  location.reload();
}

// Expose console helpers for quick testing.
if (typeof window !== 'undefined') {
  (window as any).setMockDate = setMockDate;
  (window as any).clearMockDate = clearMockDate;
}
