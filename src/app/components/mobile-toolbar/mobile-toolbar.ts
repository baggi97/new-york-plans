import { Component, inject, signal, computed, output, OnDestroy } from '@angular/core';
import { CurrencyConverterComponent } from '../currency-converter/currency-converter';
import { TripStatusService } from '../../services/trip-status.service';
import { ItineraryCheckService } from '../../services/itinerary-check.service';
import { GeolocationService, haversineMeters } from '../../services/geolocation.service';
import { TripService } from '../../services/trip.service';
import { MapMarker } from '../../data/trip.interfaces';
import { hapticTap } from '../../utils/haptics';

@Component({
  selector: 'app-mobile-toolbar',
  standalone: true,
  imports: [CurrencyConverterComponent],
  template: `
    <div class="mtoolbar">
      @if (currencyOpen()) {
        <div class="mtoolbar__sheet" (click)="currencyOpen.set(false)">
          <div class="mtoolbar__sheet-body" (click)="$event.stopPropagation()">
            <app-currency-converter />
          </div>
        </div>
      }

      @if (nearbyOpen()) {
        <div class="mtoolbar__sheet" (click)="nearbyOpen.set(false)">
          <div class="mtoolbar__sheet-body" (click)="$event.stopPropagation()">
            <div class="mtoolbar__nearby-header">
              <span class="mtoolbar__nearby-title">Tættest på dig</span>
            </div>
            @if (geo.error()) {
              <p class="mtoolbar__nearby-msg">{{ geo.error() }}</p>
            } @else if (!geo.position()) {
              <p class="mtoolbar__nearby-msg">Finder din placering...</p>
            } @else if (nearbyItems().length === 0) {
              <p class="mtoolbar__nearby-msg">Ingen steder fundet for i dag</p>
            } @else {
              <ul class="mtoolbar__nearby-list">
                @for (item of nearbyItems(); track item.marker.label) {
                  <li class="mtoolbar__nearby-item">
                    <span class="mtoolbar__nearby-dot mtoolbar__nearby-dot--{{ item.marker.category }}"></span>
                    <span class="mtoolbar__nearby-label">{{ item.marker.label }}</span>
                    <span class="mtoolbar__nearby-dist">{{ formatDist(item.distance) }}</span>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }

      <div class="mtoolbar__pills">
        <button class="mtoolbar__pill" [class.mtoolbar__pill--active]="currencyOpen()" (click)="toggleCurrency()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          Valuta
        </button>

        @if (nextItem(); as item) {
          <button class="mtoolbar__pill mtoolbar__pill--next" (click)="goToNext(item.dayId)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {{ item.label }}
          </button>
        }

        <button class="mtoolbar__pill" [class.mtoolbar__pill--active]="nearbyOpen()" (click)="toggleNearby()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          Tæt på
        </button>
      </div>
    </div>
  `,
  styleUrl: './mobile-toolbar.scss',
})
export class MobileToolbarComponent implements OnDestroy {
  navigateDay = output<number>();

  private tripStatus = inject(TripStatusService);
  private tripService = inject(TripService);
  private itinerary = inject(ItineraryCheckService);
  geo = inject(GeolocationService);

  currencyOpen = signal(false);
  nearbyOpen = signal(false);

  nextItem = computed(() => {
    const dayNum = this.tripStatus.currentDayNumber();
    if (dayNum === 0) return null;
    const day = this.tripService.days().find(d => d.id === dayNum);
    if (!day) return null;
    const idx = this.itinerary.nextUncheckedIndex(dayNum);
    if (idx === -1) return null;
    const highlight = day.highlights[idx];
    return { dayId: dayNum, label: highlight.label };
  });

  nearbyItems = computed(() => {
    const pos = this.geo.position();
    if (!pos) return [];
    const dayNum = this.tripStatus.currentDayNumber();
    const day = dayNum > 0 ? this.tripService.days().find(d => d.id === dayNum) : this.tripService.days()[0];
    if (!day) return [];
    return day.markers
      .map((marker: MapMarker) => ({ marker, distance: haversineMeters(pos, marker) }))
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 5);
  });

  toggleCurrency() {
    hapticTap();
    this.nearbyOpen.set(false);
    this.currencyOpen.update(v => !v);
  }

  toggleNearby() {
    hapticTap();
    this.currencyOpen.set(false);
    const opening = !this.nearbyOpen();
    this.nearbyOpen.set(opening);
    if (opening) this.geo.start();
  }

  goToNext(dayId: number) {
    hapticTap();
    this.navigateDay.emit(dayId);
  }

  ngOnDestroy() {
    this.geo.stop();
  }

  formatDist(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }
}
