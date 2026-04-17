import { Component, Input, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConnectivityService } from '../../services/connectivity.service';

@Component({
  selector: 'app-map-embed',
  standalone: true,
  template: `
    <div class="map">
      @if (showOffline()) {
        <div class="map__offline">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span class="map__offline-text">Kort ikke tilgængeligt offline</span>
          <a [href]="mapsLinkUrl" target="_blank" rel="noopener" class="map__offline-link">Åbn i Google Maps</a>
        </div>
      } @else {
        <iframe
          [src]="safeUrl"
          width="100%"
          height="300"
          style="border:0; border-radius: var(--radius-md);"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      }
    </div>
  `,
  styleUrl: './map-embed.scss',
})
export class MapEmbedComponent {
  private connectivity = inject(ConnectivityService);
  safeUrl!: SafeResourceUrl;
  mapsLinkUrl = '';
  showOffline = signal(!navigator.onLine);

  constructor(private sanitizer: DomSanitizer) {
    this.connectivity.onReconnect(() => this.showOffline.set(false));
    this.connectivity.onDisconnect(() => this.showOffline.set(true));
  }

  @Input() set url(value: string) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(value);
    this.mapsLinkUrl = this.extractMapsLink(value);
  }

  private extractMapsLink(embedUrl: string): string {
    try {
      const url = new URL(embedUrl);
      const pb = url.searchParams.get('pb') ?? '';
      const coordMatch = pb.match(/!2d(-?[\d.]+)!3d(-?[\d.]+)/);
      if (coordMatch) {
        return `https://www.google.com/maps/@${coordMatch[2]},${coordMatch[1]},15z`;
      }
    } catch {}
    return 'https://www.google.com/maps';
  }
}
