import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-map-embed',
  standalone: true,
  template: `
    <div class="map">
      <iframe
        [src]="safeUrl"
        width="100%"
        height="300"
        style="border:0; border-radius: var(--radius-md);"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  `,
  styleUrl: './map-embed.scss',
})
export class MapEmbedComponent {
  @Input() set url(value: string) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

  safeUrl!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}
}
