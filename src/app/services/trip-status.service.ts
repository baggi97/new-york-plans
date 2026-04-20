import { Injectable, signal, computed } from '@angular/core';
import { TRIP_DATA } from '../data/trip-data';

@Injectable({ providedIn: 'root' })
export class TripStatusService {
  private now = signal(new Date());

  private tripStart = this.parseLocalDate(TRIP_DATA.tripStart);
  private tripEnd = this.parseLocalDate(TRIP_DATA.tripEnd, true);

  status = computed(() => {
    const now = this.now();
    if (now < this.tripStart) return 'before' as const;
    if (now > this.tripEnd) return 'after' as const;
    return 'during' as const;
  });

  daysUntil = computed(() => {
    const now = this.now();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(
      parseInt(TRIP_DATA.tripStart.slice(0, 4)),
      parseInt(TRIP_DATA.tripStart.slice(5, 7)) - 1,
      parseInt(TRIP_DATA.tripStart.slice(8, 10)),
    );
    const diff = start.getTime() - today.getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  });

  private parseLocalDate(iso: string, endOfDay = false): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return endOfDay
      ? new Date(y, m - 1, d, 23, 59, 59)
      : new Date(y, m - 1, d);
  }

  currentDayNumber = computed(() => {
    if (this.status() !== 'during') return 0;
    const nycNow = new Date(this.now().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    for (const day of TRIP_DATA.days) {
      const dayDate = new Date(day.isoDate + 'T00:00:00');
      if (
        nycNow.getFullYear() === dayDate.getFullYear() &&
        nycNow.getMonth() === dayDate.getMonth() &&
        nycNow.getDate() === dayDate.getDate()
      ) {
        return day.id;
      }
    }
    return 0;
  });

  heroLabel = computed(() => {
    const s = this.status();
    if (s === 'before') {
      const d = this.daysUntil();
      if (d === 0) return 'I morgen flyver vi!';
      if (d === 1) return 'Om 1 dag!';
      return `Om ${d} dage`;
    }
    if (s === 'during') {
      const day = this.currentDayNumber();
      return day > 0 ? `Dag ${day} af 6` : 'Vi er i New York!';
    }
    return 'Minder fra New York';
  });

  nycTime = computed(() => {
    return this.now().toLocaleString('da-DK', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  dkTime = computed(() => {
    return this.now().toLocaleString('da-DK', {
      timeZone: 'Europe/Copenhagen',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  constructor() {
    setInterval(() => this.now.set(new Date()), 30_000);
  }
}
