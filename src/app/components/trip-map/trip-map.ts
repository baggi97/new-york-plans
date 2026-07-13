import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { MapMarker } from '../../data/trip.interfaces';
import { TripService } from '../../services/trip.service';
import { GeolocationService, haversineMeters } from '../../services/geolocation.service';

const MARKER_COLORS = {
  light: { highlight: '#3d4f6f', food: '#c9a96e', hotel: '#7a9a7e' },
  dark:  { highlight: '#7a94c0', food: '#d4b878', hotel: '#8db892' },
};
import { ConnectivityService } from '../../services/connectivity.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { environment } from '../../../environments/environment';
import { loadMapbox } from '../../utils/mapbox-loader';

interface RouteSegment {
  mode: 'WALK' | 'TRANSIT';
  geojson: any;
  color?: string;
  line?: string;
}

interface RouteOption {
  mode: 'walk' | 'transit';
  label: string;
  durationMin: number;
  geometry: any;
  transitSteps?: { line: string; color: string; departure: string; arrival: string; stops: number }[];
  segments?: RouteSegment[];
}

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
              @if (hasWalkRoute() && hasTransitRoute()) {
                <div class="trip-map__route-toggle">
                  <button class="trip-map__mode-btn"
                    [class.trip-map__mode-btn--active]="activeMode() === 'walk'"
                    (click)="showMode('walk')" title="Gang">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.5"/><path d="M9 20l3-8 3 8M9.5 14h5"/></svg>
                  </button>
                  <button class="trip-map__mode-btn"
                    [class.trip-map__mode-btn--active]="activeMode() === 'transit'"
                    (click)="showMode('transit')" title="Metro">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><circle cx="8.5" cy="20" r="1"/><circle cx="15.5" cy="20" r="1"/><path d="M7.5 17l-1 3M16.5 17l1 3"/></svg>
                  </button>
                </div>
              }
              <span class="trip-map__route-label">{{ routeInfo() }}</span>
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
  private tripService = inject(TripService);
  get days() { return this.tripService.days(); }
  activeDay = 1;
  showOffline = signal(!navigator.onLine);
  routeInfo = signal<string | null>(null);
  activeMode = signal<'walk' | 'transit'>('walk');
  hasWalkRoute = signal(false);
  hasTransitRoute = signal(false);

  private mapboxgl: any;
  private map: any;
  private markers: any[] = [];
  private resizeObserver?: ResizeObserver;
  private userMarker: any;
  private walkRoute: RouteOption | null = null;
  private transitRoute: RouteOption | null = null;
  private routeFrom: { lat: number; lng: number } | null = null;
  private routeMarker: MapMarker | null = null;
  private activeSegmentCount = 0;

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

    this.mapboxgl = await loadMapbox();
    this.mapboxgl.accessToken = environment.mapboxToken;

    const style = this.darkMode.isDark()
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';

    this.map = new this.mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style,
      center: [this.tripService.destination().lng, this.tripService.destination().lat],
      zoom: this.tripService.destination().mapZoom ?? 12,
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

    this.clearRoute();
    this.routeFrom = from;
    this.routeMarker = marker;
    this.routeInfo.set(`${marker.label} — henter ruter…`);

    const [walkResult, transitResult] = await Promise.allSettled([
      this.fetchWalkingRoute(from, marker),
      this.fetchTransitRoute(from, marker),
    ]);

    this.walkRoute = walkResult.status === 'fulfilled' ? walkResult.value : null;
    this.transitRoute = transitResult.status === 'fulfilled' ? transitResult.value : null;
    this.hasWalkRoute.set(!!this.walkRoute);
    this.hasTransitRoute.set(!!this.transitRoute);

    if (!this.walkRoute && !this.transitRoute) {
      const distM = Math.round(haversineMeters(from, { lat: marker.lat, lng: marker.lng }));
      this.routeInfo.set(`${marker.label} — ~${(distM / 1000).toFixed(1)} km (fugleflugt)`);
      this.showStraightLine(from, marker);
      return;
    }

    const best = this.transitRoute && this.walkRoute
      ? (this.transitRoute.durationMin < this.walkRoute.durationMin ? 'transit' : 'walk')
      : this.transitRoute ? 'transit' : 'walk';

    this.showMode(best);
  }

  showMode(mode: 'walk' | 'transit') {
    const route = mode === 'transit' ? this.transitRoute : this.walkRoute;
    if (!route) return;
    this.activeMode.set(mode);
    this.drawRoute(route);
  }

  private drawRoute(route: RouteOption) {
    const from = this.routeFrom;
    const marker = this.routeMarker;
    if (!from || !marker || !this.map) return;

    this.removeRouteLayers();
    this.routeInfo.set(route.label);

    if (route.mode === 'transit' && route.segments?.length) {
      this.drawSegmentedRoute(route.segments);
    } else {
      this.drawSingleRoute(route);
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

  private drawSingleRoute(route: RouteOption) {
    this.map.addSource('route', { type: 'geojson', data: route.geometry });
    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#3d4f6f', 'line-width': 4, 'line-opacity': 0.75 },
    });
  }

  private drawSegmentedRoute(segments: RouteSegment[]) {
    this.activeSegmentCount = segments.length;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const srcId = `route-seg-${i}`;
      const isTransit = seg.mode === 'TRANSIT';

      this.map.addSource(srcId, { type: 'geojson', data: seg.geojson });
      this.map.addLayer({
        id: srcId,
        type: 'line',
        source: srcId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': isTransit ? (seg.color || '#808080') : '#999',
          'line-width': isTransit ? 5 : 3,
          'line-opacity': isTransit ? 0.85 : 0.6,
          'line-dasharray': isTransit ? [1] : [2, 2],
        },
      });
    }
  }

  private removeRouteLayers() {
    if (!this.map) return;
    if (this.map.getLayer('route')) this.map.removeLayer('route');
    if (this.map.getSource('route')) this.map.removeSource('route');
    for (let i = 0; i < this.activeSegmentCount; i++) {
      const id = `route-seg-${i}`;
      if (this.map.getLayer(id)) this.map.removeLayer(id);
      if (this.map.getSource(id)) this.map.removeSource(id);
    }
    this.activeSegmentCount = 0;
  }

  private async fetchWalkingRoute(from: { lat: number; lng: number }, marker: MapMarker): Promise<RouteOption | null> {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${from.lng},${from.lat};${marker.lng},${marker.lat}?geometries=geojson&access_token=${environment.mapboxToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;
    const distKm = (route.distance / 1000).toFixed(1);
    const durMin = Math.round(route.duration / 60);
    return {
      mode: 'walk',
      label: `${marker.label} — 🚶 ${distKm} km · ~${durMin} min`,
      durationMin: durMin,
      geometry: route.geometry,
    };
  }

  private async fetchTransitRoute(from: { lat: number; lng: number }, marker: MapMarker): Promise<RouteOption | null> {
    const url = `/.netlify/functions/directions?olat=${from.lat}&olng=${from.lng}&dlat=${marker.lat}&dlng=${marker.lng}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.geojson || data.durationSec <= 0) return null;
    const durMin = Math.round(data.durationSec / 60);
    const lines = (data.transitSteps || []).map((s: any) => s.line).filter(Boolean).join(' → ');
    const transitLabel = lines ? `🚇 ${lines}` : '🚇 Transit';
    return {
      mode: 'transit',
      label: `${marker.label} — ${transitLabel} · ~${durMin} min`,
      durationMin: durMin,
      geometry: data.geojson,
      transitSteps: data.transitSteps,
      segments: data.segments,
    };
  }

  private showStraightLine(from: { lat: number; lng: number }, marker: MapMarker) {
    if (!this.map || !this.mapboxgl) return;

    this.removeRouteLayers();

    const geojson = {
      type: 'LineString' as const,
      coordinates: [[from.lng, from.lat], [marker.lng, marker.lat]],
    };

    this.map.addSource('route', { type: 'geojson', data: geojson });
    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#3d4f6f', 'line-width': 3, 'line-opacity': 0.5, 'line-dasharray': [2, 2] },
    });

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
    this.walkRoute = null;
    this.transitRoute = null;
    this.routeFrom = null;
    this.routeMarker = null;
    this.hasWalkRoute.set(false);
    this.hasTransitRoute.set(false);
    this.removeRouteLayers();
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
