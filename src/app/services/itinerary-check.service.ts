import { Injectable, signal, inject, effect } from '@angular/core';
import { TripService } from './trip.service';

const API = '/.netlify/functions/checklist';

@Injectable({ providedIn: 'root' })
export class ItineraryCheckService {
  private tripService = inject(TripService);

  private get lsChecked() { return this.tripService.tripId() + '-itinerary'; }
  private get lsSkipped() { return this.tripService.tripId() + '-itinerary-skipped'; }

  private checked = signal<Set<string>>(new Set());
  private skipped = signal<Set<string>>(new Set());
  private pushInFlight = false;
  private localDirtyAt = 0;
  private pushTimer?: ReturnType<typeof setTimeout>;
  private loadedForTrip = '';

  constructor() {
    effect(() => {
      const id = this.tripService.tripId();
      if (id !== this.loadedForTrip) {
        this.loadedForTrip = id;
        this.checked.set(this.loadSet(this.lsChecked));
        this.skipped.set(this.loadSet(this.lsSkipped));
        this.syncFromServer();
      }
    });
  }

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
    this.saveSet(this.lsChecked, next);
    this.localDirtyAt = Date.now();
    this.debouncedPush();
  }

  skip(dayId: number, index: number) {
    const key = `${dayId}-${index}`;
    const next = new Set(this.skipped());
    next.add(key);
    this.skipped.set(next);
    this.saveSet(this.lsSkipped, next);
    this.localDirtyAt = Date.now();
    this.debouncedPush();
  }

  unskip(dayId: number, index: number) {
    const key = `${dayId}-${index}`;
    const next = new Set(this.skipped());
    next.delete(key);
    this.skipped.set(next);
    this.saveSet(this.lsSkipped, next);
    this.localDirtyAt = Date.now();
    this.debouncedPush();
  }

  dayProgress(dayId: number): { done: number; total: number } {
    const day = this.tripService.days().find(d => d.id === dayId);
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
    const day = this.tripService.days().find(d => d.id === dayId);
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
      const res = await fetch(`${API}?tripId=${this.tripService.tripId()}`);
      if (!res.ok) return;
      const data = await res.json();

      const serverChecked = new Set<string>(Array.isArray(data) ? data : (data.checked ?? []));
      const serverSkipped = new Set<string>(Array.isArray(data) ? [] : (data.skipped ?? []));

      const localChecked = this.checked();
      const localSkipped = this.skipped();

      const checkedChanged = serverChecked.size !== localChecked.size ||
        [...serverChecked].some(k => !localChecked.has(k));
      const skippedChanged = serverSkipped.size !== localSkipped.size ||
        [...serverSkipped].some(k => !localSkipped.has(k));

      if (checkedChanged) {
        this.checked.set(serverChecked);
        this.saveSet(this.lsChecked, serverChecked);
      }
      if (skippedChanged) {
        this.skipped.set(serverSkipped);
        this.saveSet(this.lsSkipped, serverSkipped);
      }
    } catch { /* offline or server error -- use local cache */ }
  }

  private async pushToServer() {
    if (!navigator.onLine) return;
    this.pushInFlight = true;
    try {
      await fetch(`${API}?tripId=${this.tripService.tripId()}`, {
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
