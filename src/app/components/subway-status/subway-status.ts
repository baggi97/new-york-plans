import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';

interface SubwayAlert {
  id: string;
  routes: string[];
  title: string;
  description: string;
  severity: string;
}

const LINE_COLORS: Record<string, string> = {
  N: '#fccc0a', R: '#fccc0a', W: '#fccc0a',
  '7': '#b933ad',
  A: '#0039a6', C: '#0039a6', E: '#0039a6',
  '1': '#ee352e', '2': '#ee352e', '3': '#ee352e',
};

const ALL_LINES = ['N', 'R', 'W', '7', 'A', 'C', 'E', '1', '2', '3'];

@Component({
  selector: 'app-subway-status',
  standalone: true,
  template: `
    @if (tripStatus.status() === 'during') {
      <div class="subway">
        <h3 class="subway__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16M8 21l4-4 4 4"/></svg>
          Subway-status
        </h3>
        <div class="subway__lines">
          @for (line of allLines; track line) {
            <span class="subway__badge"
              [style.background]="lineColor(line)"
              [class.subway__badge--alert]="hasAlert(line)">
              {{ line }}
            </span>
          }
        </div>
        @if (alerts().length > 0) {
          <div class="subway__alerts">
            @for (alert of alerts(); track alert.id) {
              <div class="subway__alert" [class.subway__alert--severe]="alert.severity === 'SEVERE'">
                <div class="subway__alert-routes">
                  @for (r of alert.routes; track r) {
                    <span class="subway__mini-badge" [style.background]="lineColor(r)">{{ r }}</span>
                  }
                </div>
                <p class="subway__alert-text">{{ alert.title }}</p>
              </div>
            }
          </div>
        } @else if (loaded()) {
          <p class="subway__ok">Normal drift på alle linjer</p>
        }
      </div>
    }
  `,
  styleUrl: './subway-status.scss',
})
export class SubwayStatusComponent implements OnInit, OnDestroy {
  tripStatus = inject(TripStatusService);
  alerts = signal<SubwayAlert[]>([]);
  loaded = signal(false);
  allLines = ALL_LINES;
  private interval?: ReturnType<typeof setInterval>;
  private alertedRoutes = new Set<string>();

  ngOnInit() {
    if (this.tripStatus.status() === 'during') {
      this.fetchAlerts();
      this.interval = setInterval(() => this.fetchAlerts(), 2 * 60_000);
    }
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  private async fetchAlerts() {
    try {
      const res = await fetch('/.netlify/functions/subway');
      if (!res.ok) return;
      const data: SubwayAlert[] = await res.json();
      this.alerts.set(data);
      this.loaded.set(true);
      this.alertedRoutes.clear();
      for (const a of data) {
        for (const r of a.routes) this.alertedRoutes.add(r);
      }
    } catch { /* offline */ }
  }

  lineColor(line: string): string {
    return LINE_COLORS[line] || '#808080';
  }

  hasAlert(line: string): boolean {
    return this.alertedRoutes.has(line);
  }
}
