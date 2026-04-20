import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { ConnectivityService } from '../../services/connectivity.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { MapMarker } from '../../data/trip.interfaces';
import { environment } from '../../../environments/environment';

const MARKER_COLORS = {
  light: { highlight: '#3d4f6f', food: '#c9a96e', hotel: '#7a9a7e' },
  dark:  { highlight: '#7a94c0', food: '#d4b878', hotel: '#8db892' },
};

@Component({
  selector: 'app-map-embed',
  standalone: true,
  template: `
    <div class="map">
      @if (showOffline()) {
        <div class="map__offline">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span class="map__offline-text">Kort ikke tilgængeligt offline</span>
        </div>
      } @else {
        <div #mapEl class="map__canvas"></div>
      }
    </div>
  `,
  styleUrl: './map-embed.scss',
})
export class MapEmbedComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef<HTMLElement>;

  private connectivity = inject(ConnectivityService);
  private darkMode = inject(DarkModeService);
  showOffline = signal(!navigator.onLine);

  private mapboxgl: any;
  private map: any;
  private mapMarkers: any[] = [];
  private _markers: MapMarker[] = [];
  private resizeObserver?: ResizeObserver;
  private viewReady = false;

  @Input() set markers(value: MapMarker[]) {
    this._markers = value ?? [];
    if (this.viewReady && !this.showOffline()) {
      this.renderMarkers();
    }
  }

  @Input() url = '';

  constructor() {
    this.connectivity.onReconnect(() => {
      this.showOffline.set(false);
      setTimeout(() => this.initMap(), 100);
    });
    this.connectivity.onDisconnect(() => this.showOffline.set(true));
    this.darkMode.onChange(dark => this.switchStyle(dark));
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (!this.showOffline()) {
      this.initMap();
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private async initMap() {
    if (this.map || !this.mapEl) return;

    const mb = await import('mapbox-gl');
    this.mapboxgl = mb.default ?? mb;
    this.mapboxgl.accessToken = environment.mapboxToken;

    const style = this.darkMode.isDark()
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';

    this.map = new this.mapboxgl.Map({
      container: this.mapEl.nativeElement,
      style,
      center: [-73.985, 40.748],
      zoom: 12,
      attributionControl: false,
      interactive: false,
    });

    this.map.addControl(new this.mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    this.map.on('load', () => this.renderMarkers());

    this.resizeObserver = new ResizeObserver(() => this.map?.resize());
    this.resizeObserver.observe(this.mapEl.nativeElement);
  }

  private renderMarkers() {
    this.mapMarkers.forEach((m: any) => m.remove());
    this.mapMarkers = [];

    if (!this._markers.length || !this.map || !this.mapboxgl) return;

    const bounds = new this.mapboxgl.LngLatBounds();

    const palette = this.darkMode.isDark() ? MARKER_COLORS.dark : MARKER_COLORS.light;

    for (const point of this._markers) {
      const marker = new this.mapboxgl.Marker({
          color: palette[point.category],
          scale: 0.65,
        })
        .setLngLat([point.lng, point.lat])
        .setPopup(
          new this.mapboxgl.Popup({ offset: 18, closeButton: false, maxWidth: '180px' })
            .setHTML(`<span class="map-popup__label">${point.label}</span>`)
        )
        .addTo(this.map);

      this.mapMarkers.push(marker);
      bounds.extend([point.lng, point.lat]);
    }

    this.map.fitBounds(bounds, { padding: 30, maxZoom: 14, duration: 0 });
  }

  private switchStyle(dark: boolean) {
    if (!this.map) return;
    const style = dark
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';
    this.map.setStyle(style);
    this.map.once('style.load', () => this.renderMarkers());
  }
}
