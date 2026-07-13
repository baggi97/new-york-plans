import { Injectable, signal, inject, effect } from '@angular/core';
import { TripService } from './trip.service';
import { HighlightItem } from '../data/trip.interfaces';

const API = '/.netlify/functions/checklist';

export interface DayItem {
  srcDay: number;
  srcIndex: number;
  highlight: HighlightItem;
  movedFrom: number | null;
}

@Injectable({ providedIn: 'root' })
export class ItineraryCheckService {
  private tripService = inject(TripService);

  private get lsChecked() { return this.tripService.tripId() + '-itinerary'; }
  private get lsSkipped() { return this.tripService.tripId() + '-itinerary-skipped'; }
  private get lsMoved() { return this.tripService.tripId() + '-itinerary-moved'; }

  private checked = signal<Set<string>>(new Set());
  private skipped = signal<Set<string>>(new Set());
  private moved = signal<Record<string, number>>({});
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
        this.moved.set(this.loadMap(this.lsMoved));
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

  /** Target day this item has been moved to, or null if it lives on its own day. */
  isMoved(dayId: number, index: number): number | null {
    const t = this.moved()[`${dayId}-${index}`];
    return typeof t === 'number' ? t : null;
  }

  /** The items to display on a given day: its own (minus ones moved away) plus incoming. */
  itemsForDay(dayId: number): DayItem[] {
    const days = this.tripService.days();
    const movedMap = this.moved();
    const result: DayItem[] = [];

    const self = days.find(d => d.id === dayId);
    if (self) {
      self.highlights.forEach((highlight, srcIndex) => {
        if (movedMap[`${dayId}-${srcIndex}`] === undefined) {
          result.push({ srcDay: dayId, srcIndex, highlight, movedFrom: null });
        }
      });
    }

    for (const day of days) {
      if (day.id === dayId) continue;
      day.highlights.forEach((highlight, srcIndex) => {
        if (movedMap[`${day.id}-${srcIndex}`] === dayId) {
          result.push({ srcDay: day.id, srcIndex, highlight, movedFrom: day.id });
        }
      });
    }

    return result;
  }

  move(srcDay: number, srcIndex: number, targetDay: number) {
    const key = `${srcDay}-${srcIndex}`;
    if (targetDay === srcDay) { this.unmove(srcDay, srcIndex); return; }
    const next = { ...this.moved(), [key]: targetDay };
    this.moved.set(next);
    this.saveMap(this.lsMoved, next);
    // A moved item is active on its new day — clear any skip on it.
    if (this.skipped().has(key)) {
      const s = new Set(this.skipped());
      s.delete(key);
      this.skipped.set(s);
      this.saveSet(this.lsSkipped, s);
    }
    this.localDirtyAt = Date.now();
    this.debouncedPush();
  }

  unmove(srcDay: number, srcIndex: number) {
    const key = `${srcDay}-${srcIndex}`;
    if (this.moved()[key] === undefined) return;
    const next = { ...this.moved() };
    delete next[key];
    this.moved.set(next);
    this.saveMap(this.lsMoved, next);
    this.localDirtyAt = Date.now();
    this.debouncedPush();
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
    let total = 0;
    let done = 0;
    for (const item of this.itemsForDay(dayId)) {
      const key = `${item.srcDay}-${item.srcIndex}`;
      if (this.skipped().has(key)) continue;
      total++;
      if (this.checked().has(key)) done++;
    }
    return { done, total };
  }

  /** First unchecked, non-skipped item displayed on the day (moved-aware). */
  nextUncheckedItem(dayId: number): DayItem | null {
    for (const item of this.itemsForDay(dayId)) {
      const key = `${item.srcDay}-${item.srcIndex}`;
      if (this.skipped().has(key)) continue;
      if (!this.checked().has(key)) return item;
    }
    return null;
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
      const serverMoved: Record<string, number> = Array.isArray(data) ? {} : (data.moved ?? {});

      const localChecked = this.checked();
      const localSkipped = this.skipped();
      const localMoved = this.moved();

      const checkedChanged = serverChecked.size !== localChecked.size ||
        [...serverChecked].some(k => !localChecked.has(k));
      const skippedChanged = serverSkipped.size !== localSkipped.size ||
        [...serverSkipped].some(k => !localSkipped.has(k));
      const movedChanged = JSON.stringify(serverMoved) !== JSON.stringify(localMoved);

      if (checkedChanged) {
        this.checked.set(serverChecked);
        this.saveSet(this.lsChecked, serverChecked);
      }
      if (skippedChanged) {
        this.skipped.set(serverSkipped);
        this.saveSet(this.lsSkipped, serverSkipped);
      }
      if (movedChanged) {
        this.moved.set(serverMoved);
        this.saveMap(this.lsMoved, serverMoved);
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
          moved: this.moved(),
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

  private loadMap(key: string): Record<string, number> {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore */ }
    return {};
  }

  private saveMap(key: string, map: Record<string, number>) {
    localStorage.setItem(key, JSON.stringify(map));
  }
}
