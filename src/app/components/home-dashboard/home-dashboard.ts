import { Component, inject, OnInit, OnDestroy, AfterViewInit, output, signal, computed } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';
import { ItineraryCheckService } from '../../services/itinerary-check.service';
import { WeatherService } from '../../services/weather.service';
import { TRIP_DATA } from '../../data/trip-data';
import { Booking } from '../../data/trip.interfaces';
import { hapticTap } from '../../utils/haptics';

type QuickTab = 'dage' | 'kort' | 'mad';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  template: `
    <div class="dash">
      @for (img of images; track img; let i = $index) {
        <div class="dash__bg"
             [class.dash__bg--active]="i === activeIdx()"
             [style.backgroundImage]="'url(' + img + ')'">
        </div>
      }
      <div class="dash__overlay"></div>

      <!-- Header -->
      <div class="dash__header">
        <span class="dash__badge">{{ tripStatus.heroLabel() }}</span>
        <h1 class="dash__title">New York</h1>
        <span class="dash__dates">{{ trip.dates }} · {{ trip.travelers }}</span>
      </div>

      <!-- Status cards -->
      <div class="dash__cards">
        <div class="dash__card">
          <span class="dash__card-icon">{{ tripStatus.status() === 'during' ? '📍' : '✈️' }}</span>
          <span class="dash__card-value">{{ countdownValue() }}</span>
          <span class="dash__card-label">{{ countdownLabel() }}</span>
        </div>

        <div class="dash__card dash__card--weather">
          @if (todayWeather(); as w) {
            <div class="dash__weather-left">
              <span class="dash__weather-icon">{{ weather.icon(w.code) }}</span>
              <span class="dash__weather-high">{{ w.tempMax }}°</span>
              <span class="dash__weather-low">{{ w.tempMin }}°</span>
            </div>
            <div class="dash__weather-right">
              <span class="dash__weather-desc">{{ weather.label(w.code) }}</span>
              <span class="dash__weather-stat">💧 {{ w.precipProbability }}%</span>
              <span class="dash__weather-stat">💨 {{ w.windSpeed }} m/s</span>
            </div>
          } @else {
            <span class="dash__weather-icon">🌤️</span>
            <span class="dash__card-label">Vejr</span>
          }
        </div>

        <div class="dash__card dash__card--clocks">
          <div class="dash__clock dash__clock--primary">
            <span class="dash__clock-label">NYC</span>
            <span class="dash__clock-time">{{ tripStatus.nycTime() }}</span>
          </div>
          <div class="dash__clock-divider"></div>
          <div class="dash__clock dash__clock--secondary">
            <span class="dash__clock-label">DK</span>
            <span class="dash__clock-time">{{ tripStatus.dkTime() }}</span>
          </div>
        </div>
      </div>

      <!-- Main section: progress during trip, day grid before/after -->
      <div class="dash__main">
        @if (tripStatus.status() === 'during' && currentDay(); as day) {
          <div class="dash__progress">
            <div class="dash__progress-ring">
              <svg viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--color-border)" stroke-width="5"/>
                <circle cx="36" cy="36" r="30" fill="none"
                        stroke="var(--color-accent-sage)" stroke-width="5"
                        stroke-linecap="round"
                        [attr.stroke-dasharray]="circumference"
                        [attr.stroke-dashoffset]="progressOffset()"
                        transform="rotate(-90 36 36)"/>
              </svg>
              <span class="dash__progress-pct">{{ progressPct() }}%</span>
            </div>
            <div class="dash__progress-info">
              <span class="dash__progress-title">{{ day.title }}</span>
              <span class="dash__progress-theme">{{ day.theme }}</span>
              <span class="dash__progress-detail">{{ progressDone() }}/{{ progressTotal() }} punkter</span>
              @if (nextItemLabel(); as label) {
                <span class="dash__progress-next">Næste: {{ label }}</span>
              }
            </div>
          </div>
        } @else {
          <div class="dash__days">
            @for (day of trip.days; track day.id) {
              <button class="dash__day-pill" (click)="goToDay(day.id)">
                <span class="dash__day-date">{{ day.date }}</span>
                <span class="dash__day-num">Dag {{ day.id }}</span>
                <span class="dash__day-theme">{{ day.theme }}</span>
                <div class="dash__day-tags">
                  @if (dayWeather(day.isoDate); as w) {
                    <span class="dash__day-tag">{{ weather.icon(w.code) }} {{ w.tempMax }}°</span>
                  }
                  @if (day.bookings.length > 0) {
                    <span class="dash__day-tag dash__day-tag--booking">📋 {{ day.bookings.length }}</span>
                  }
                </div>
              </button>
            }
          </div>
        }
      </div>

      <!-- Upcoming bookings -->
      @if (upcomingBookings().length > 0) {
        <div class="dash__bookings">
          <span class="dash__section-label">Kommende bookinger</span>
          <div class="dash__booking-list">
            @for (b of upcomingBookings(); track b.booking.label) {
              <div class="dash__booking" [class.dash__booking--soon]="b.soon">
                <span class="dash__booking-label">{{ b.booking.label }}</span>
                <span class="dash__booking-time">{{ b.countdown }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Quick access -->
      <div class="dash__quick">
        <button class="dash__quick-btn" (click)="navigate('dage')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Program</span>
        </button>
        <button class="dash__quick-btn" (click)="navigate('kort')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>Kort</span>
        </button>
        <button class="dash__quick-btn" (click)="navigate('mad')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
            <path d="M7 2v20"/>
            <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
          </svg>
          <span>Mad</span>
        </button>
      </div>
    </div>
  `,
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  tabChange = output<QuickTab>();
  dayNavigate = output<number>();

  tripStatus = inject(TripStatusService);
  private itinerary = inject(ItineraryCheckService);
  weather = inject(WeatherService);

  trip = TRIP_DATA;
  circumference = 2 * Math.PI * 30;

  activeIdx = signal(0);
  images = [
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=60',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=60',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=60',
    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&q=60',
    'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&q=60',
  ];

  private imageInterval?: ReturnType<typeof setInterval>;
  private bookingInterval?: ReturnType<typeof setInterval>;
  private bookingCountdowns = signal<Map<string, { countdown: string; soon: boolean }>>(new Map());

  countdownValue = computed(() => {
    const s = this.tripStatus.status();
    if (s === 'before') {
      const d = this.tripStatus.daysUntil();
      return d === 0 ? '🎉' : `${d}`;
    }
    if (s === 'during') return `Dag ${this.tripStatus.currentDayNumber()}`;
    return '6';
  });

  countdownLabel = computed(() => {
    const s = this.tripStatus.status();
    if (s === 'before') {
      const d = this.tripStatus.daysUntil();
      if (d === 0) return 'vi flyver i dag!';
      if (d === 1) return 'dag endnu';
      return 'dage endnu';
    }
    if (s === 'during') return 'af 6';
    return 'dage oplevet';
  });

  currentDay = computed(() => {
    const num = this.tripStatus.currentDayNumber();
    return num > 0 ? this.trip.days.find(d => d.id === num) ?? null : null;
  });

  todayWeather = computed(() => {
    const day = this.currentDay();
    if (day) {
      return this.weather.byDate().get(day.isoDate) ?? null;
    }
    const all = this.weather.allDays();
    return all.length > 0 ? all[0] : null;
  });

  progressDone = computed(() => {
    const day = this.currentDay();
    return day ? this.itinerary.dayProgress(day.id).done : 0;
  });

  progressTotal = computed(() => {
    const day = this.currentDay();
    return day ? this.itinerary.dayProgress(day.id).total : 0;
  });

  progressPct = computed(() => {
    const total = this.progressTotal();
    return total > 0 ? Math.round((this.progressDone() / total) * 100) : 0;
  });

  progressOffset = computed(() => {
    const pct = this.progressPct();
    return this.circumference * (1 - pct / 100);
  });

  nextItemLabel = computed(() => {
    const day = this.currentDay();
    if (!day) return null;
    const idx = this.itinerary.nextUncheckedIndex(day.id);
    return idx >= 0 ? day.highlights[idx]?.label ?? null : null;
  });

  upcomingBookings = computed(() => {
    const countdowns = this.bookingCountdowns();
    const results: { booking: Booking; countdown: string; soon: boolean }[] = [];

    for (const day of this.trip.days) {
      for (const b of day.bookings) {
        const entry = countdowns.get(b.label);
        if (entry) {
          results.push({ booking: b, ...entry });
        }
      }
    }
    return results;
  });

  ngOnInit() {
    this.weather.load();
    this.updateBookingCountdowns();
    this.bookingInterval = setInterval(() => this.updateBookingCountdowns(), 1000);
  }

  ngAfterViewInit() {
    this.imageInterval = setInterval(() => {
      this.activeIdx.update(i => (i + 1) % this.images.length);
    }, 7000);
  }

  ngOnDestroy() {
    if (this.bookingInterval) clearInterval(this.bookingInterval);
    if (this.imageInterval) clearInterval(this.imageInterval);
  }

  navigate(tab: QuickTab) {
    hapticTap();
    this.tabChange.emit(tab);
  }

  goToDay(dayId: number) {
    hapticTap();
    this.dayNavigate.emit(dayId);
  }

  dayWeather(isoDate: string) {
    return this.weather.byDate().get(isoDate) ?? null;
  }

  private updateBookingCountdowns() {
    const map = new Map<string, { countdown: string; soon: boolean }>();
    const now = Date.now();

    for (const day of this.trip.days) {
      for (const b of day.bookings) {
        if (!b.time) continue;
        const diff = new Date(b.time).getTime() - now;
        if (diff <= 0 || diff > 48 * 3600_000) continue;

        const h = Math.floor(diff / 3600_000);
        const m = Math.floor((diff % 3600_000) / 60_000);
        const s = Math.floor((diff % 60_000) / 1000);
        const countdown = h > 0 ? `${h}t ${m}m` : `${m}m ${s}s`;
        map.set(b.label, { countdown, soon: diff < 3600_000 });
      }
    }
    this.bookingCountdowns.set(map);
  }
}
