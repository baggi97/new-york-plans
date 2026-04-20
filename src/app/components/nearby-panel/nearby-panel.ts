import { Component, inject, signal, computed, OnDestroy, HostListener } from '@angular/core';
import { GeolocationService, haversineMeters } from '../../services/geolocation.service';
import { TripStatusService } from '../../services/trip-status.service';
import { TRIP_DATA } from '../../data/trip-data';
import { MapMarker } from '../../data/trip.interfaces';
import { hapticTap } from '../../utils/haptics';

interface NearbyItem {
  marker: MapMarker;
  distance: number;
}

@Component({
  selector: 'app-nearby-panel',
  standalone: true,
  template: `
    @if (isVisible()) {
    <div class="nearby-fab">
      @if (isOpen()) {
        <div class="nearby-fab__panel">
          <div class="nearby-fab__header">
            <span class="nearby-fab__title">Tættest på dig</span>
            <button class="nearby-fab__close" (click)="close()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          @if (geo.error()) {
            <p class="nearby-fab__error">{{ geo.error() }}</p>
          } @else if (!geo.position()) {
            <p class="nearby-fab__loading">Finder din placering...</p>
          } @else if (items().length === 0) {
            <p class="nearby-fab__empty">Ingen steder fundet for i dag</p>
          } @else {
            <ul class="nearby-fab__list">
              @for (item of items(); track item.marker.label) {
                <li class="nearby-fab__item">
                  <span class="nearby-fab__dot nearby-fab__dot--{{ item.marker.category }}"></span>
                  <span class="nearby-fab__label">{{ item.marker.label }}</span>
                  <span class="nearby-fab__dist">{{ formatDist(item.distance) }}</span>
                </li>
              }
            </ul>
          }
        </div>
      }
      <button class="nearby-fab__btn" [class.nearby-fab__btn--active]="isOpen()" (click)="toggle()" aria-label="Tættest på mig">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      </button>
    </div>
    }
  `,
  styleUrl: './nearby-panel.scss',
})
export class NearbyPanelComponent implements OnDestroy {
  geo = inject(GeolocationService);
  private tripStatus = inject(TripStatusService);
  isOpen = signal(false);
  isVisible = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.isVisible.set(window.scrollY > window.innerHeight * 0.5);
  }

  items = computed<NearbyItem[]>(() => {
    const pos = this.geo.position();
    if (!pos) return [];
    const dayNum = this.tripStatus.currentDayNumber();
    const day = dayNum > 0
      ? TRIP_DATA.days.find(d => d.id === dayNum)
      : TRIP_DATA.days[0];
    if (!day) return [];

    return day.markers
      .map(marker => ({ marker, distance: haversineMeters(pos, marker) }))
      .sort((a, b) => a.distance - b.distance);
  });

  toggle() {
    hapticTap();
    const opening = !this.isOpen();
    this.isOpen.set(opening);
    if (opening) this.geo.start();
  }

  close() {
    this.isOpen.set(false);
  }

  ngOnDestroy() {
    this.geo.stop();
  }

  formatDist(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }
}
