import { Injectable, signal, computed, inject } from '@angular/core';
import { TripService } from './trip.service';

@Injectable({ providedIn: 'root' })
export class TripStatusService {
  private tripService = inject(TripService);
  private now = signal(new Date());

  private get tripData() { return this.tripService.trip(); }

  private get tripStart() {
    return this.parseLocalDate(this.tripData.tripStart);
  }

  private get tripEnd() {
    return this.parseLocalDate(this.tripData.tripEnd, true);
  }

  status = computed(() => {
    const now = this.now();
    if (now < this.tripStart) return 'before' as const;
    if (now > this.tripEnd) return 'after' as const;
    return 'during' as const;
  });

  daysUntil = computed(() => {
    const now = this.now();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = this.parseLocalDate(this.tripData.tripStart);
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
    const destTz = this.tripService.destTz();
    const destNow = new Date(this.now().toLocaleString('en-US', { timeZone: destTz }));
    for (const day of this.tripService.days()) {
      const dayDate = new Date(day.isoDate + 'T00:00:00');
      if (
        destNow.getFullYear() === dayDate.getFullYear() &&
        destNow.getMonth() === dayDate.getMonth() &&
        destNow.getDate() === dayDate.getDate()
      ) {
        return day.id;
      }
    }
    return 0;
  });

  heroLabel = computed(() => {
    const s = this.status();
    const trip = this.tripData;
    const totalDays = trip.days.length;
    if (s === 'before') {
      const d = this.daysUntil();
      if (d === 0) return 'I morgen flyver vi!';
      if (d === 1) return 'Om 1 dag!';
      return `Om ${d} dage`;
    }
    if (s === 'during') {
      const day = this.currentDayNumber();
      return day > 0 ? `Dag ${day} af ${totalDays}` : `Vi er i ${trip.destination.city}!`;
    }
    return `Minder fra ${trip.destination.city}`;
  });

  destTime = computed(() => {
    return this.now().toLocaleString('da-DK', {
      timeZone: this.tripService.destTz(),
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  homeTime = computed(() => {
    return this.now().toLocaleString('da-DK', {
      timeZone: this.tripService.homeTz(),
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  // Keep backward compat aliases
  nycTime = this.destTime;
  dkTime = this.homeTime;

  constructor() {
    setInterval(() => this.now.set(new Date()), 30_000);
  }
}
