import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { Booking } from '../../data/trip.interfaces';

@Component({
  selector: 'app-booking-badge',
  standalone: true,
  template: `
    @for (booking of bookings; track booking.label) {
      @if (booking.url) {
        <a [href]="booking.url" target="_blank" rel="noopener" class="badge badge--link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="badge__label">Booking</span>
          <span class="badge__name">{{ booking.label }}</span>
          @if (countdowns()[booking.label]) {
            <span class="badge__countdown" [class.badge__countdown--soon]="isSoon(booking)">
              {{ countdowns()[booking.label] }}
            </span>
          }
          <svg class="badge__arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17l9.2-9.2M17 17V7.8H7.8"/>
          </svg>
        </a>
      } @else {
        <div class="badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="badge__label">Booking</span>
          <span class="badge__name">{{ booking.label }}</span>
          @if (countdowns()[booking.label]) {
            <span class="badge__countdown" [class.badge__countdown--soon]="isSoon(booking)">
              {{ countdowns()[booking.label] }}
            </span>
          }
        </div>
      }
    }
  `,
  styleUrl: './booking-badge.scss',
})
export class BookingBadgeComponent implements OnInit, OnDestroy {
  @Input() bookings: Booking[] = [];
  countdowns = signal<Record<string, string>>({});
  private interval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.updateCountdowns();
    this.interval = setInterval(() => this.updateCountdowns(), 1000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  isSoon(booking: Booking): boolean {
    if (!booking.time) return false;
    const diff = new Date(booking.time).getTime() - Date.now();
    return diff > 0 && diff < 3600_000;
  }

  private updateCountdowns() {
    const result: Record<string, string> = {};
    for (const b of this.bookings) {
      if (!b.time) continue;
      const diff = new Date(b.time).getTime() - Date.now();
      if (diff <= 0 || diff > 24 * 3600_000) continue;

      const h = Math.floor(diff / 3600_000);
      const m = Math.floor((diff % 3600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      result[b.label] = h > 0
        ? `${h}t ${m}m ${s}s`
        : `${m}m ${s}s`;
    }
    this.countdowns.set(result);
  }
}
