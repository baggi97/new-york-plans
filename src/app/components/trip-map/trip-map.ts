import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TRIP_DATA } from '../../data/trip-data';
import { ConnectivityService } from '../../services/connectivity.service';

@Component({
  selector: 'app-trip-map',
  standalone: true,
  template: `
    <section id="kort" class="trip-map">
      <div class="container">
        <div class="trip-map__header">
          <span class="trip-map__eyebrow">Kort</span>
          <h2 class="trip-map__title">Hele turens rute</h2>
        </div>
        <div class="trip-map__tabs">
          @for (day of days; track day.id) {
            <button class="trip-map__tab"
              [class.trip-map__tab--active]="activeDay === day.id"
              (click)="setDay(day.id)">
              Dag {{ day.id }}
            </button>
          }
        </div>
        <div class="trip-map__frame">
          @if (showOffline()) {
            <div class="trip-map__offline">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="trip-map__offline-text">Kort ikke tilgængeligt offline</span>
              <a href="https://www.google.com/maps" target="_blank" rel="noopener" class="trip-map__offline-link">Åbn Google Maps</a>
            </div>
          } @else {
            <iframe [src]="activeSafeUrl" width="100%" height="450" style="border:0; border-radius: var(--radius-md);" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          }
        </div>
        <div class="trip-map__info">
          <span class="trip-map__day-title">{{ activeDayData.title }}</span>
          @if (activeDayData.walkingDistance) {
            <span class="trip-map__walk">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><path d="M9 20l3-8 3 8M9.5 14h5"/></svg>
              {{ activeDayData.walkingDistance }}
            </span>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './trip-map.scss',
})
export class TripMapComponent {
  private connectivity = inject(ConnectivityService);
  days = TRIP_DATA.days;
  activeDay = 1;
  showOffline = signal(!navigator.onLine);

  private safeUrls: Map<number, SafeResourceUrl>;

  constructor(private sanitizer: DomSanitizer) {
    this.safeUrls = new Map(
      this.days.map(d => [d.id, this.sanitizer.bypassSecurityTrustResourceUrl(d.mapEmbedUrl)])
    );
    this.connectivity.onReconnect(() => this.showOffline.set(false));
    this.connectivity.onDisconnect(() => this.showOffline.set(true));
  }

  get activeSafeUrl(): SafeResourceUrl {
    return this.safeUrls.get(this.activeDay)!;
  }

  get activeDayData() {
    return this.days.find(d => d.id === this.activeDay) ?? this.days[0];
  }

  setDay(id: number) {
    this.activeDay = id;
  }
}
