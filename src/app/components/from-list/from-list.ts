import { Component, Input } from '@angular/core';
import { FromListItem } from '../../data/trip.interfaces';

@Component({
  selector: 'app-from-list',
  standalone: true,
  template: `
    @if (items.length > 0) {
      <div class="from-list">
        <h4 class="from-list__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z"/>
          </svg>
          Fra vores liste
        </h4>
        <div class="from-list__items">
          @for (item of items; track item.label) {
            <a [href]="item.googleMapsUrl" target="_blank" rel="noopener" class="from-list__chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ item.label }}
            </a>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './from-list.scss',
})
export class FromListComponent {
  @Input() items: FromListItem[] = [];
}
