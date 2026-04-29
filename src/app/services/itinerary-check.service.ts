import { Injectable, signal } from '@angular/core';
import { TRIP_DATA } from '../data/trip-data';

const API = '/.netlify/functions/checklist';
const LS_CHECKED = 'nyc-itinerary';
const LS_SKIPPED = 'nyc-itinerary-skipped';

@Injectable({ providedIn: 'root' })
export class ItineraryCheckService {
  private checked = signal<Set<string>>(this.loadSet(LS_CHECKED));
  private skipped = signal<Set<string>>(this.loadSet(LS_SKIPPED));
  private pushInFlight = false;
  private localDirtyAt = 0;
  private pushTimer?: ReturnType<typeof setTimeout>;

  init() {
    this.syncFromServer();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.syncFromServer();
    });
    setInterval(() => {
      if (document.visibilityState === 'visible') this.syncFromServer();
    }, 20_000);
  }

  isChecked(dayId: number, index: number): boolean {
    return this.checked().has(`${dayId}-${index}`);
  }

  isSkipped(dayId: number, index: number): boolean {
    return this.skipped().has(`${dayId}-${index}`);
  }

  toggle(dayId: number, index: number) {
    const key = `${dayId}-${index}`;
    if (this.skipped().has(key)) return;
    const next = new Set(this.checked());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.checked.set(next);
    this.saveSet(LS_CHECKED, next);
    this.localDirtyAt = Date.now();
    this.debouncedPush();
  }

  skip(dayId: number, index: number) {
    const key = `${dayId}-${index}`;
    const next = new Set(this.skipped());
    next.add(key);
    this.skipped.set(next);
    this.saveSet(LS_SKIPPED, next);
    this.localDirtyAt = Date.now();
    this.debouncedPush();
  }

  unskip(dayId: number, index: number) {
    const key = `${dayId}-${index}`;
    const next = new Set(this.skipped());
    next.delete(key);
    this.skipped.set(next);
    this.saveSet(LS_SKIPPED, next);
    this.localDirtyAt = Date.now();
    this.debouncedPush();
  }

  dayProgress(dayId: number): { done: number; total: number } {
    const day = TRIP_DATA.days.find(d => d.id === dayId);
    if (!day) return { done: 0, total: 0 };
    let total = 0;
    let done = 0;
    for (let i = 0; i < day.highlights.length; i++) {
      const key = `${dayId}-${i}`;
      if (this.skipped().has(key)) continue;
      total++;
      if (this.checked().has(key)) done++;
    }
    return { done, total };
  }

  nextUncheckedIndex(dayId: number): number {
    const day = TRIP_DATA.days.find(d => d.id === dayId);
    if (!day) return -1;
    for (let i = 0; i < day.highlights.length; i++) {
      const key = `${dayId}-${i}`;
      if (this.skipped().has(key)) continue;
      if (!this.checked().has(key)) return i;
    }
    return -1;
  }

  private debouncedPush() {
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      this.pushToServer();
    }, 500);
  }

  private async syncFromServer() {
    if (!navigator.onLine) return;
    if (this.pushInFlight) return;
    if (Date.now() - this.localDirtyAt < 3000) return;

    try {
      const res = await fetch(API);
      if (!res.ok) return;
      const data = await res.json();

      // Backward compat: server may return old plain array format
      const serverChecked = new Set<string>(Array.isArray(data) ? data : (data.checked ?? []));
      const serverSkipped = new Set<string>(Array.isArray(data) ? [] : (data.skipped ?? []));

      const localChecked = this.checked();
      const localSkipped = this.skipped();

      const mergedChecked = new Set([...localChecked, ...serverChecked]);
      const mergedSkipped = new Set([...localSkipped, ...serverSkipped]);

      let changed = false;
      if (mergedChecked.size !== localChecked.size) {
        this.checked.set(mergedChecked);
        this.saveSet(LS_CHECKED, mergedChecked);
        changed = true;
      }
      if (mergedSkipped.size !== localSkipped.size) {
        this.skipped.set(mergedSkipped);
        this.saveSet(LS_SKIPPED, mergedSkipped);
        changed = true;
      }

      if (changed) {
        this.pushToServer();
      }
    } catch { /* offline or server error -- use local cache */ }
  }

  private async pushToServer() {
    if (!navigator.onLine) return;
    this.pushInFlight = true;
    try {
      await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checked: [...this.checked()],
          skipped: [...this.skipped()],
        }),
      });
    } catch { /* best effort */ } finally {
      this.pushInFlight = false;
    }
  }

  private loadSet(key: string): Set<string> {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return new Set(JSON.parse(stored));
    } catch { /* ignore */ }
    return new Set();
  }

  private saveSet(key: string, set: Set<string>) {
    localStorage.setItem(key, JSON.stringify([...set]));
  }
}
