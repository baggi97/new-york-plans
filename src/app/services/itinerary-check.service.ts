import { Injectable, signal, computed } from '@angular/core';
import { TRIP_DATA } from '../data/trip-data';

@Injectable({ providedIn: 'root' })
export class ItineraryCheckService {
  private checked = signal<Set<string>>(this.load());

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

  private load(): Set<string> {
    try {
      const stored = localStorage.getItem('nyc-itinerary');
      if (stored) return new Set(JSON.parse(stored));
    } catch { /* ignore */ }
    return new Set();
  }

  private save(checked: Set<string>) {
    localStorage.setItem('nyc-itinerary', JSON.stringify([...checked]));
  }
}
