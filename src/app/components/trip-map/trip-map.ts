import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { TRIP_DATA } from '../../data/trip-data';
import { MapMarker } from '../../data/trip.interfaces';
import { GeolocationService, haversineMeters } from '../../services/geolocation.service';

const MARKER_COLORS = {
  light: { highlight: '#3d4f6f', food: '#c9a96e', hotel: '#7a9a7e' },
  dark:  { highlight: '#7a94c0', food: '#d4b878', hotel: '#8db892' },
};
import { ConnectivityService } from '../../services/connectivity.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { environment } from '../../../environments/environment';

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
            </div>
          } @else {
            <div #mapContainer class="trip-map__canvas"></div>
          }
          @if (routeInfo()) {
            <div class="trip-map__route-bar">
              <span>{{ routeInfo() }}</span>
              <button class="trip-map__route-close" (click)="clearRoute()">✕ Luk</button>
            </div>
          }
        </div>
        <div class="trip-map__legend">
          <span class="trip-map__legend-item"><span class="trip-map__legend-dot trip-map__legend-dot--highlight"></span>Seværdighed</span>
          <span class="trip-map__legend-item"><span class="trip-map__legend-dot trip-map__legend-dot--food"></span>Mad & drikke</span>
          <span class="trip-map__legend-item"><span class="trip-map__legend-dot trip-map__legend-dot--hotel"></span>Hotel</span>
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
export class TripMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLElement>;

  private connectivity = inject(ConnectivityService);
  private darkMode = inject(DarkModeService);
  private geo = inject(GeolocationService);
  days = TRIP_DATA.days;
  activeDay = 1;
  showOffline = signal(!navigator.onLine);
  routeInfo = signal<string | null>(null);

  private mapboxgl: any;
  private map: any;
  private markers: any[] = [];
  private resizeObserver?: ResizeObserver;
  private userMarker: any;

  constructor() {
    this.connectivity.onReconnect(() => {
      this.showOffline.set(false);
      setTimeout(() => this.initMap(), 100);
    });
    this.connectivity.onDisconnect(() => this.showOffline.set(true));
    this.darkMode.onChange(dark => this.switchStyle(dark));
  }

  ngAfterViewInit() {
    if (!this.showOffline()) {
      this.initMap();
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  get activeDayData() {
    return this.days.find(d => d.id === this.activeDay) ?? this.days[0];
  }

  setDay(id: number) {
    this.activeDay = id;
    this.updateMarkers();
  }

  private async initMap() {
    if (this.map || !this.mapContainer) return;

    const mb = await import('mapbox-gl');
    this.mapboxgl = mb.default ?? mb;
    this.mapboxgl.accessToken = environment.mapboxToken;

    const style = this.darkMode.isDark()
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';

    this.map = new this.mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style,
      center: [-73.985, 40.748],
      zoom: 12,
      attributionControl: false,
    });

    this.map.addControl(new this.mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    this.map.addControl(new this.mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    this.map.on('load', () => this.updateMarkers());

    this.resizeObserver = new ResizeObserver(() => this.map?.resize());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private updateMarkers() {
    this.markers.forEach((m: any) => m.remove());
    this.markers = [];

    const dayData = this.activeDayData;
    if (!dayData.markers?.length || !this.map || !this.mapboxgl) return;

    const bounds = new this.mapboxgl.LngLatBounds();

    const palette = this.darkMode.isDark() ? MARKER_COLORS.dark : MARKER_COLORS.light;

    for (const point of dayData.markers) {
      const popup = new this.mapboxgl.Popup({ offset: 20, closeButton: false, maxWidth: '220px' })
        .setHTML(`<span class="map-popup__label">${point.label}</span><button class="map-popup__nav" data-marker-label="${point.label}">Vis vej</button>`);

      popup.on('open', () => {
        const btn = popup.getElement()?.querySelector('.map-popup__nav') as HTMLElement;
        btn?.addEventListener('click', () => this.navigateTo(point));
      });

      const marker = new this.mapboxgl.Marker({
          color: palette[point.category],
          scale: 0.7,
        })
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(this.map);

      this.markers.push(marker);
      bounds.extend([point.lng, point.lat]);
    }

    this.map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 600 });
  }

  async navigateTo(marker: MapMarker) {
    this.geo.start();
    const pos = this.geo.position();
    if (!pos) {
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (this.geo.position()) { clearInterval(check); resolve(); }
        }, 500);
        setTimeout(() => { clearInterval(check); resolve(); }, 5000);
      });
    }
    const from = this.geo.position();
    if (!from || !this.map) return;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${from.lng},${from.lat};${marker.lng},${marker.lat}?geometries=geojson&access_token=${environment.mapboxToken}`;
      const res = await fetch(url);

      this.clearRoute();

      if (!res.ok) {
        const distM = Math.round(
          haversineMeters(from, { lat: marker.lat, lng: marker.lng }),
        );
        this.routeInfo.set(`${marker.label} — ~${(distM / 1000).toFixed(1)} km (fugleflugt)`);
        this.showStraightLine(from, marker);
        return;
      }

      const data = await res.json();
      const route = data.routes?.[0];
      if (!route) return;

      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = Math.round(route.duration / 60);
      this.routeInfo.set(`${marker.label} — ${distKm} km · ~${durMin} min`);

      if (this.map.getSource('route')) {
        (this.map.getSource('route') as any).setData(route.geometry);
      } else {
        this.map.addSource('route', { type: 'geojson', data: route.geometry });
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#3d4f6f', 'line-width': 4, 'line-opacity': 0.7 },
        });
      }

      this.userMarker?.remove();
      this.userMarker = new this.mapboxgl.Marker({ color: '#e8635a', scale: 0.6 })
        .setLngLat([from.lng, from.lat])
        .addTo(this.map);

      const bounds = new this.mapboxgl.LngLatBounds();
      bounds.extend([from.lng, from.lat]);
      bounds.extend([marker.lng, marker.lat]);
      this.map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 600 });
    } catch { /* offline or API error */ }
  }

  private showStraightLine(from: { lat: number; lng: number }, marker: MapMarker) {
    if (!this.map || !this.mapboxgl) return;

    const geojson = {
      type: 'LineString' as const,
      coordinates: [[from.lng, from.lat], [marker.lng, marker.lat]],
    };

    if (this.map.getSource('route')) {
      (this.map.getSource('route') as any).setData(geojson);
    } else {
      this.map.addSource('route', { type: 'geojson', data: geojson });
      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#3d4f6f', 'line-width': 3, 'line-opacity': 0.5, 'line-dasharray': [2, 2] },
      });
    }

    this.userMarker?.remove();
    this.userMarker = new this.mapboxgl.Marker({ color: '#e8635a', scale: 0.6 })
      .setLngLat([from.lng, from.lat])
      .addTo(this.map);

    const bounds = new this.mapboxgl.LngLatBounds();
    bounds.extend([from.lng, from.lat]);
    bounds.extend([marker.lng, marker.lat]);
    this.map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 600 });
  }

  clearRoute() {
    this.routeInfo.set(null);
    if (this.map?.getLayer('route')) this.map.removeLayer('route');
    if (this.map?.getSource('route')) this.map.removeSource('route');
    this.userMarker?.remove();
    this.userMarker = null;
  }

  private switchStyle(dark: boolean) {
    if (!this.map) return;
    const style = dark
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';
    this.map.setStyle(style);
    this.map.once('style.load', () => this.updateMarkers());
  }
}
