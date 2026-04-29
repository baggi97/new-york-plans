import { Component, inject, OnInit, OnDestroy, AfterViewInit, output, signal, computed } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';
import { ItineraryCheckService } from '../../services/itinerary-check.service';
import { WeatherService } from '../../services/weather.service';
import { TripService } from '../../services/trip.service';
import { Booking } from '../../data/trip.interfaces';
import { hapticTap } from '../../utils/haptics';

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
        <h1 class="dash__title">{{ trip.title }}</h1>
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
            <span class="dash__clock-label">{{ trip.destination.city }}</span>
            <span class="dash__clock-time">{{ tripStatus.destTime() }}</span>
          </div>
          <div class="dash__clock-divider"></div>
          <div class="dash__clock dash__clock--secondary">
            <span class="dash__clock-label">Hjemme</span>
            <span class="dash__clock-time">{{ tripStatus.homeTime() }}</span>
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
                <div class="dash__day-top">
                  <span class="dash__day-date">{{ day.date }}</span>
                  <span class="dash__day-num">Dag {{ day.id }}</span>
                </div>
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

    </div>
  `,
  styleUrl: './home-dashboard.scss',
})
export class HomeDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  dayNavigate = output<number>();

  tripStatus = inject(TripStatusService);
  private itinerary = inject(ItineraryCheckService);
  weather = inject(WeatherService);
  private tripService = inject(TripService);

  get trip() { return this.tripService.trip(); }
  circumference = 2 * Math.PI * 30;

  activeIdx = signal(0);
  get images() { return this.trip.heroImages ?? []; }

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
    return `${this.trip.days.length}`;
  });

  countdownLabel = computed(() => {
    const s = this.tripStatus.status();
    if (s === 'before') {
      const d = this.tripStatus.daysUntil();
      if (d === 0) return 'vi flyver i dag!';
      if (d === 1) return 'dag endnu';
      return 'dage endnu';
    }
    if (s === 'during') return `af ${this.trip.days.length}`;
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
