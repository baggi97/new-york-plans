import { Component } from '@angular/core';
import { TRIP_DATA } from '../../data/trip-data';

@Component({
  selector: 'app-trip-summary',
  standalone: true,
  template: `
    <section id="overblik" class="summary">
      <div class="container">
        <div class="summary__header">
          <span class="summary__eyebrow">Rejseoverblik</span>
          <h2 class="summary__title">6 dage i New York</h2>
          <p class="summary__subtitle">{{ trip.dates }} · {{ trip.travelers }}</p>
        </div>
        <div class="summary__grid">
          @for (day of trip.days; track day.id) {
            <a [href]="'#dag-' + day.id" class="summary__card">
              <span class="summary__card-day">Dag {{ day.id }}</span>
              <span class="summary__card-date">{{ day.date }}</span>
              <h3 class="summary__card-title">{{ day.title }}</h3>
              <span class="summary__card-theme">{{ day.theme }}</span>
              @if (day.walkingDistance) {
                <span class="summary__card-walk">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><path d="M9 20l3-8 3 8M9.5 14h5"/></svg>
                  {{ day.walkingDistance }}
                </span>
              }
              @if (day.bookings.length > 0) {
                <span class="summary__card-booking">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  Booking
                </span>
              }
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './trip-summary.scss',
})
export class TripSummaryComponent {
  trip = TRIP_DATA;
}
