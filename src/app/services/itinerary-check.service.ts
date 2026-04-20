import { Injectable, signal } from '@angular/core';
import { TRIP_DATA } from '../data/trip-data';

const API = '/.netlify/functions/checklist';
const LS_KEY = 'nyc-itinerary';

@Injectable({ providedIn: 'root' })
export class ItineraryCheckService {
  private checked = signal<Set<string>>(this.load());

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

  toggle(dayId: number, index: number) {
    const key = `${dayId}-${index}`;
    const next = new Set(this.checked());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.checked.set(next);
    this.save(next);
    this.pushToServer(next);
  }

  dayProgress(dayId: number): { done: number; total: number } {
    const day = TRIP_DATA.days.find(d => d.id === dayId);
    if (!day) return { done: 0, total: 0 };
    const total = day.highlights.length;
    let done = 0;
    for (let i = 0; i < total; i++) {
      if (this.checked().has(`${dayId}-${i}`)) done++;
    }
    return { done, total };
  }

  nextUncheckedIndex(dayId: number): number {
    const day = TRIP_DATA.days.find(d => d.id === dayId);
    if (!day) return -1;
    for (let i = 0; i < day.highlights.length; i++) {
      if (!this.checked().has(`${dayId}-${i}`)) return i;
    }
    return -1;
  }

  private async syncFromServer() {
    if (!navigator.onLine) return;
    try {
      const res = await fetch(API);
      if (!res.ok) return;
      const items: string[] = await res.json();
      const set = new Set(items);
      this.checked.set(set);
      this.save(set);
    } catch { /* offline or server error -- use cache */ }
  }

  private async pushToServer(checked: Set<string>) {
    if (!navigator.onLine) return;
    try {
      await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...checked]),
      });
    } catch { /* best effort */ }
  }

  private load(): Set<string> {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) return new Set(JSON.parse(stored));
    } catch { /* ignore */ }
    return new Set();
  }

  private save(checked: Set<string>) {
    localStorage.setItem(LS_KEY, JSON.stringify([...checked]));
  }
}
