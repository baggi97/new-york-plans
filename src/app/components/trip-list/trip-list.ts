import { Component, inject, output, OnInit } from '@angular/core';
import { TripService, TripMeta } from '../../services/trip.service';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  template: `
    <div class="trip-list">
      <div class="trip-list__header">
        <span class="trip-list__eyebrow">Dine rejser</span>
        <h2 class="trip-list__title">Rejseguide</h2>
      </div>

      @if (tripService.loading()) {
        <div class="trip-list__loading">Indlæser...</div>
      } @else if (trips.length === 0) {
        <div class="trip-list__empty">
          <p>Ingen rejser endnu.</p>
        </div>
      } @else {
        <div class="trip-list__grid">
          @for (trip of trips; track trip.id) {
            <button class="trip-list__card"
              [class.trip-list__card--active]="trip.id === activeId"
              (click)="selectTrip(trip.id)">
              <span class="trip-list__card-city">{{ trip.city }}</span>
              <span class="trip-list__card-title">{{ trip.title }}</span>
              <span class="trip-list__card-dates">{{ trip.dates }}</span>
              @if (trip.id === activeId) {
                <span class="trip-list__card-badge">Aktiv</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './trip-list.scss',
})
export class TripListComponent implements OnInit {
  tripService = inject(TripService);
  tripSelected = output<string>();

  get trips(): TripMeta[] { return this.tripService.trips(); }
  get activeId(): string { return this.tripService.tripId(); }

  ngOnInit() {
    this.tripService.loadTrips();
  }

  async selectTrip(id: string) {
    await this.tripService.selectTrip(id);
    this.tripSelected.emit(id);
  }
}
