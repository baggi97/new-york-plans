import { Component, Input } from '@angular/core';
import { TripDay } from '../../data/trip.interfaces';
import { BookingBadgeComponent } from '../booking-badge/booking-badge';
import { FromListComponent } from '../from-list/from-list';
import { MapEmbedComponent } from '../map-embed/map-embed';

@Component({
  selector: 'app-day-section',
  standalone: true,
  imports: [BookingBadgeComponent, FromListComponent, MapEmbedComponent],
  template: `
    <section [id]="'dag-' + day.id" class="day" [class.day--even]="day.id % 2 === 0">
      <div class="container">
        <div class="day__header">
          <span class="day__number">Dag {{ day.id }}</span>
          <h2 class="day__title">{{ day.title }}</h2>
          <div class="day__meta">
            <span class="day__date">{{ day.date }}</span>
            <span class="day__divider">·</span>
            <span class="day__theme">{{ day.theme }}</span>
          </div>
          @if (day.bookings.length > 0) {
            <div class="day__bookings">
              <app-booking-badge [bookings]="day.bookings" />
            </div>
          }
        </div>

        <div class="day__hero-image">
          <img [src]="heroImage.url" [alt]="heroImage.alt" loading="lazy" />
        </div>

        <div class="day__body">
          <div class="day__content">
            <p class="day__intro">{{ day.intro }}</p>

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
                    <div class="day__food-item">
                      <span class="day__food-name">{{ spot.name }}</span>
                      @if (spot.note) {
                        <span class="day__food-note">{{ spot.note }}</span>
                      }
                    </div>
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
              @for (img of supportingImages; track img.url) {
                <img [src]="img.url" [alt]="img.alt" loading="lazy" class="day__grid-image" />
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

  get heroImage(): { url: string; alt: string } {
    return this.day.images.find(i => i.hero) ?? this.day.images[0];
  }

  get supportingImages() {
    return this.day.images.filter(i => !i.hero);
  }
}
