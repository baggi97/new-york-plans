import { Component, Input, inject } from '@angular/core';
import { TripDay } from '../../data/trip.interfaces';
import { BookingBadgeComponent } from '../booking-badge/booking-badge';
import { FromListComponent } from '../from-list/from-list';
import { MapEmbedComponent } from '../map-embed/map-embed';
import { TripStatusService } from '../../services/trip-status.service';
import { LightboxService } from '../../services/lightbox.service';

@Component({
  selector: 'app-day-section',
  standalone: true,
  imports: [BookingBadgeComponent, FromListComponent, MapEmbedComponent],
  template: `
    <section [id]="'dag-' + day.id" class="day" [class.day--even]="day.id % 2 === 0" [class.day--today]="isToday">
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
          @if (day.bookings.length > 0) {
            <div class="day__bookings">
              <app-booking-badge [bookings]="day.bookings" />
            </div>
          }
          <button class="day__share" (click)="shareDay()" aria-label="Del denne dag">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>

        <div class="day__hero-image" (click)="openLightbox(0)">
          <img [src]="heroImage.url" [alt]="heroImage.alt" loading="lazy" />
        </div>

        <div class="day__body">
          <div class="day__content">
            <p class="day__intro">{{ day.intro }}</p>

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

            <div class="day__highlights">
              <h3 class="day__section-title">Dagens program</h3>
              <ul class="day__list">
                @for (item of day.highlights; track item) {
                  <li>{{ item }}</li>
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
                        <span class="day__food-name">{{ spot.name }}</span>
                        @if (spot.note) {
                          <span class="day__food-note">{{ spot.note }}</span>
                        }
                        <svg class="day__food-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7.8H7.8"/></svg>
                      </a>
                    } @else {
                      <div class="day__food-item">
                        <span class="day__food-name">{{ spot.name }}</span>
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

            <app-map-embed [url]="day.mapEmbedUrl" />

            <app-from-list [items]="day.fromList" />
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './day-section.scss',
})
export class DaySectionComponent {
  @Input({ required: true }) day!: TripDay;

  private tripStatus = inject(TripStatusService);
  private lightbox = inject(LightboxService);

  get isToday(): boolean {
    return this.tripStatus.currentDayNumber() === this.day.id;
  }

  get heroImage(): { url: string; alt: string } {
    return this.day.images.find(i => i.hero) ?? this.day.images[0];
  }

  get supportingImages() {
    return this.day.images.filter(i => !i.hero);
  }

  openLightbox(index: number) {
    this.lightbox.open(this.day.images, index);
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
