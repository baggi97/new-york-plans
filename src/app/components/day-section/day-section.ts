import { Component, Input, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { TripDay } from '../../data/trip.interfaces';
import { BookingBadgeComponent } from '../booking-badge/booking-badge';
import { FromListComponent } from '../from-list/from-list';
import { MapEmbedComponent } from '../map-embed/map-embed';
import { PhotoJournalComponent } from '../photo-journal/photo-journal';
import { DailyRecapComponent } from '../daily-recap/daily-recap';
import { TripStatusService } from '../../services/trip-status.service';
import { LightboxService } from '../../services/lightbox.service';
import { WeatherService } from '../../services/weather.service';
import { ItineraryCheckService } from '../../services/itinerary-check.service';
import { hapticTap, hapticSuccess } from '../../utils/haptics';
import { fireConfetti } from '../../utils/confetti';

@Component({
  selector: 'app-day-section',
  standalone: true,
  imports: [BookingBadgeComponent, FromListComponent, MapEmbedComponent, PhotoJournalComponent, DailyRecapComponent],
  template: `
    <section [id]="'dag-' + day.id" class="day" [class.day--even]="day.id % 2 === 0" [class.day--today]="isToday" [class.day--visible]="isVisible()">
      <div class="container">
        <div class="day__header">
          @if (isToday) {
            <span class="day__today-badge">I dag</span>
          }
          <span class="day__number">Dag {{ day.id }}</span>
          <h2 class="day__title">{{ day.title }}</h2>
          <div class="day__meta">
            <span class="day__date">{{ day.date }}</span>
            <span class="day__divider">·</span>
            <span class="day__theme">{{ day.theme }}</span>
            @if (day.walkingDistance) {
              <span class="day__divider">·</span>
              <span class="day__walking">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><path d="M9 20l3-8 3 8M9.5 14h5"/></svg>
                {{ day.walkingDistance }}
              </span>
            }
          </div>
          @if (dayWeather; as w) {
            <div class="day__weather">
              <span class="day__weather-icon">{{ weatherService.icon(w.code) }}</span>
              <span class="day__weather-temp">{{ w.tempMax }}°</span>
              <span class="day__weather-label">{{ weatherService.label(w.code) }}</span>
              @if (w.precipitation > 0) {
                <span class="day__weather-rain">💧 {{ w.precipitation }} mm</span>
              }
            </div>
          }
          @if (day.bookings.length > 0) {
            <div class="day__bookings">
              <app-booking-badge [bookings]="day.bookings" />
            </div>
          }
          <button class="day__share" (click)="shareDay()" aria-label="Del denne dag">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>

        <button class="day__toggle" (click)="toggleCollapse()">
          <span>{{ collapsed() ? 'Vis program' : 'Skjul program' }}</span>
          <svg [class.day__toggle-icon--up]="!collapsed()" class="day__toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        @if (!collapsed()) {
        <div class="day__hero-image"
          (click)="openLightbox(heroImageIndex)"
          (touchstart)="onHeroTouchStart($event)"
          (touchend)="onHeroTouchEnd($event)">
          <img [src]="activeHeroUrl()" [alt]="heroImage.alt" loading="lazy" />
          @if (day.images.length > 1) {
            <div class="day__hero-dots">
              @for (img of day.images; track img.url; let i = $index) {
                <button class="day__hero-dot" [class.day__hero-dot--active]="heroIdx() === i" (click)="setHero(i, $event)" aria-label="Billede {{ i + 1 }}"></button>
              }
            </div>
          }
        </div>

        <div class="day__body">
          <div class="day__content">
            <p class="day__intro">{{ day.intro }}</p>

            @if (day.funFact) {
              <div class="day__fun-fact">
                <span class="day__fun-fact-icon">💡</span>
                <p class="day__fun-fact-text">{{ day.funFact }}</p>
              </div>
            }

            @if (day.tips && day.tips.length > 0) {
              <div class="day__tips">
                <h3 class="day__section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 00-3 13.33V17h6v-1.67A7 7 0 0012 2zM9 21h6"/></svg>
                  Tips
                </h3>
                <ul class="day__tips-list">
                  @for (tip of day.tips; track tip) {
                    <li>{{ tip }}</li>
                  }
                </ul>
              </div>
            }

            <div class="day__highlights" [id]="'program-' + day.id">
              <div class="day__section-header">
                <h3 class="day__section-title">Dagens program</h3>
                <span class="day__progress-label">{{ itineraryProgress.done }} / {{ itineraryProgress.total }}</span>
              </div>
              <div class="day__progress-bar">
                <div class="day__progress-fill" [style.width.%]="itineraryPercent"></div>
              </div>
              <ul class="day__list">
                @for (item of day.highlights; track item.label; let i = $index) {
                  <li [class.day__list-item--checked]="itinerary.isChecked(day.id, i)"
                      [class.day__list-item--skipped]="itinerary.isSkipped(day.id, i)">
                    @if (itinerary.isSkipped(day.id, i)) {
                      <div class="day__check-label day__check-label--skipped">
                        <span class="day__item-label">{{ item.label }}</span>
                        <button class="day__restore-btn" (click)="onUnskip(day.id, i)">Gendan</button>
                      </div>
                    } @else {
                      <label class="day__check-label">
                        <input type="checkbox" [checked]="itinerary.isChecked(day.id, i)" (change)="onToggle(day.id, i)" />
                        <span class="day__checkbox">
                          @if (itinerary.isChecked(day.id, i)) {
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                          }
                        </span>
                        <span class="day__item-label">{{ item.label }}</span>
                        @if (item.duration) {
                          <span class="day__item-duration">{{ item.duration }}</span>
                        }
                      </label>
                      <button class="day__skip-btn" (click)="onSkip(day.id, i)" title="Spring over">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    }
                  </li>
                }
              </ul>
            </div>

            @if (day.food.length > 0) {
              <div class="day__food">
                <h3 class="day__section-title">Mad & drikke</h3>
                <div class="day__food-items">
                  @for (spot of day.food; track spot.name) {
                    @if (spot.url) {
                      <a [href]="spot.url" target="_blank" rel="noopener" class="day__food-item day__food-item--link">
                        <span class="day__food-name">
                          {{ spot.name }}
                          @if (spot.price) {
                            <span class="day__food-price">{{ spot.price }}</span>
                          }
                        </span>
                        @if (spot.note) {
                          <span class="day__food-note">{{ spot.note }}</span>
                        }
                        <svg class="day__food-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7.8H7.8"/></svg>
                      </a>
                    } @else {
                      <div class="day__food-item">
                        <span class="day__food-name">
                          {{ spot.name }}
                          @if (spot.price) {
                            <span class="day__food-price">{{ spot.price }}</span>
                          }
                        </span>
                        @if (spot.note) {
                          <span class="day__food-note">{{ spot.note }}</span>
                        }
                      </div>
                    }
                  }
                </div>
              </div>
            }

            <div class="day__transport">
              <h3 class="day__section-title">Transport</h3>
              <div class="day__transport-items">
                @for (t of day.transport; track t) {
                  <span class="day__transport-chip">{{ t }}</span>
                }
              </div>
            </div>
          </div>

          <div class="day__sidebar">
            <div class="day__images-grid">
              @for (img of supportingImages; track img.url; let i = $index) {
                <img [src]="img.url" [alt]="img.alt" loading="lazy" class="day__grid-image" (click)="openLightbox(i + 1)" />
              }
            </div>

            <app-map-embed [markers]="day.markers" />

            <app-from-list [items]="day.fromList" />

            <app-photo-journal [dayId]="day.id" />
          </div>
        </div>

        <app-daily-recap [day]="day" />
        }
      </div>
    </section>
  `,
  styleUrl: './day-section.scss',
})
export class DaySectionComponent implements OnInit, OnDestroy {
  @Input({ required: true }) day!: TripDay;

  private tripStatus = inject(TripStatusService);
  private lightbox = inject(LightboxService);
  weatherService = inject(WeatherService);
  itinerary = inject(ItineraryCheckService);

  heroIdx = signal(0);
  isVisible = signal(false);
  collapsed = signal(false);
  private observer?: IntersectionObserver;
  private heroInterval?: ReturnType<typeof setInterval>;
  private touchStartX = 0;
  private touchStartY = 0;
  private confettiFired = false;

  ngOnInit() {
    const stored = localStorage.getItem(`nyc-collapsed-${this.day.id}`);
    if (stored === 'true') this.collapsed.set(true);

    this.heroInterval = setInterval(() => {
      this.heroIdx.update(i => (i + 1) % this.day.images.length);
    }, 6000);
  }

  toggleCollapse() {
    this.collapsed.update(v => !v);
    localStorage.setItem(`nyc-collapsed-${this.day.id}`, String(this.collapsed()));
  }

  ngOnDestroy() {
    if (this.heroInterval) clearInterval(this.heroInterval);
    this.observer?.disconnect();
  }

  get isToday(): boolean {
    return this.tripStatus.currentDayNumber() === this.day.id;
  }

  get dayWeather() {
    return this.weatherService.byDate().get(this.day.isoDate) ?? null;
  }

  get heroImage(): { url: string; alt: string } {
    return this.day.images.find(i => i.hero) ?? this.day.images[0];
  }

  get heroImageIndex(): number {
    return this.heroIdx();
  }

  activeHeroUrl = () => this.day.images[this.heroIdx()]?.url ?? this.heroImage.url;

  get supportingImages() {
    return this.day.images.filter(i => !i.hero);
  }

  get itineraryProgress() {
    return this.itinerary.dayProgress(this.day.id);
  }

  get itineraryPercent() {
    const p = this.itineraryProgress;
    return p.total > 0 ? (p.done / p.total) * 100 : 0;
  }

  setHero(idx: number, event: Event) {
    event.stopPropagation();
    this.heroIdx.set(idx);
    if (this.heroInterval) clearInterval(this.heroInterval);
    this.heroInterval = setInterval(() => {
      this.heroIdx.update(i => (i + 1) % this.day.images.length);
    }, 6000);
  }

  onHeroTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  onHeroTouchEnd(e: TouchEvent) {
    const dx = this.touchStartX - e.changedTouches[0].clientX;
    const dy = this.touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;

    e.preventDefault();
    const total = this.day.images.length;
    if (dx > 0) {
      this.setHero((this.heroIdx() + 1) % total, e);
    } else {
      this.setHero((this.heroIdx() - 1 + total) % total, e);
    }
  }

  openLightbox(index: number) {
    this.lightbox.open(this.day.images, index);
  }

  onToggle(dayId: number, index: number) {
    hapticTap();
    this.itinerary.toggle(dayId, index);
    this.checkCompletion();
  }

  onSkip(dayId: number, index: number) {
    hapticTap();
    this.itinerary.skip(dayId, index);
    this.checkCompletion();
  }

  onUnskip(dayId: number, index: number) {
    hapticTap();
    this.itinerary.unskip(dayId, index);
  }

  private checkCompletion() {
    const p = this.itineraryProgress;
    if (p.total > 0 && p.done === p.total && !this.confettiFired) {
      const key = `nyc-confetti-${this.day.id}`;
      if (!localStorage.getItem(key)) {
        hapticSuccess();
        fireConfetti();
        localStorage.setItem(key, '1');
      }
      this.confettiFired = true;
    }
  }

  async shareDay() {
    const text = `Dag ${this.day.id}: ${this.day.title} — ${this.day.date}\n${this.day.intro}`;
    const url = window.location.origin + `/#dag-${this.day.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `NYC Dag ${this.day.id}`, text, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  }
}
