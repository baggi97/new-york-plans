import { Component, inject, computed } from '@angular/core';
import { ConnectivityService } from '../../services/connectivity.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  template: `
    @if (isOffline()) {
      <div class="offline-bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>
        <span>Du er offline — alt indhold er tilgængeligt</span>
      </div>
    }
  `,
  styleUrl: './offline-indicator.scss',
})
export class OfflineIndicatorComponent {
  private connectivity = inject(ConnectivityService);
  isOffline = computed(() => !this.connectivity.isOnline());
}
