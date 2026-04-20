import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';

interface FlightInfo {
  ident: string;
  status: string;
  origin: { code: string; city: string; gate?: string };
  destination: { code: string; city: string; gate?: string; terminal?: string };
  scheduledDeparture: string;
  estimatedDeparture: string;
  actualDeparture: string | null;
  scheduledArrival: string;
  estimatedArrival: string;
  actualArrival: string | null;
  progressPercent: number;
}

@Component({
  selector: 'app-flight-tracker',
  standalone: true,
  template: `
    @if (flight()) {
      <div class="flight-card">
        <div class="flight-card__header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1l5.5 3.2-2.9 2.9L4.3 13c-.4-.1-.9.1-1 .5l-.1.4c-.1.4 0 .8.3 1l3.1 2.1L8.7 20c.2.3.6.4 1 .3l.4-.1c.4-.2.6-.6.5-1.1z"/>
          </svg>
          <span class="flight-card__ident">{{ flight()!.ident }}</span>
          <span class="flight-card__status flight-card__status--{{ statusClass() }}">{{ statusLabel() }}</span>
        </div>

        <div class="flight-card__route">
          <div class="flight-card__airport">
            <span class="flight-card__code">{{ flight()!.origin.code }}</span>
            <span class="flight-card__time">{{ formatTime(flight()!.actualDeparture || flight()!.estimatedDeparture || flight()!.scheduledDeparture) }}</span>
            @if (flight()!.origin.gate) {
              <span class="flight-card__gate">Gate {{ flight()!.origin.gate }}</span>
            }
          </div>
          <div class="flight-card__progress-track">
            <div class="flight-card__progress-fill" [style.width.%]="flight()!.progressPercent || 0"></div>
            <svg class="flight-card__plane-icon" [style.left.%]="flight()!.progressPercent || 0" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <div class="flight-card__airport">
            <span class="flight-card__code">{{ flight()!.destination.code }}</span>
            <span class="flight-card__time">{{ formatTime(flight()!.actualArrival || flight()!.estimatedArrival || flight()!.scheduledArrival) }}</span>
            @if (flight()!.destination.terminal) {
              <span class="flight-card__gate">Terminal {{ flight()!.destination.terminal }}</span>
            }
          </div>
        </div>

        @if (delay()) {
          <div class="flight-card__delay">{{ delay() }}</div>
        }
      </div>
    }
  `,
  styleUrl: './flight-tracker.scss',
})
export class FlightTrackerComponent implements OnInit, OnDestroy {
  private tripStatus = inject(TripStatusService);
  flight = signal<FlightInfo | null>(null);
  private interval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.fetchFlight();
    this.interval = setInterval(() => this.fetchFlight(), 5 * 60_000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  private get flightIdent(): string | null {
    const day = this.tripStatus.currentDayNumber();
    if (day === 1) return 'SAS909';
    if (day === 6) return 'SAS910';
    const status = this.tripStatus.status();
    if (status === 'before') return 'SAS909';
    return null;
  }

  private async fetchFlight() {
    const ident = this.flightIdent;
    if (!ident) return;
    try {
      const res = await fetch(`/.netlify/functions/flight?ident=${ident}`);
      if (!res.ok) return;
      const flights: FlightInfo[] = await res.json();
      if (flights.length > 0) {
        this.flight.set(flights[flights.length - 1]);
      }
    } catch { /* offline */ }
  }

  formatTime(iso: string | null): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleTimeString('da-DK', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch { return '—'; }
  }

  statusClass(): string {
    const s = this.flight()?.status;
    if (!s) return 'unknown';
    if (s.includes('En Route') || s.includes('Airborne')) return 'inflight';
    if (s.includes('Arrived') || s.includes('Landed')) return 'landed';
    if (s.includes('Delayed')) return 'delayed';
    return 'scheduled';
  }

  statusLabel(): string {
    const s = this.flight()?.status;
    if (!s) return '';
    if (s.includes('En Route') || s.includes('Airborne')) return 'I luften';
    if (s.includes('Arrived') || s.includes('Landed')) return 'Landet';
    if (s.includes('Delayed')) return 'Forsinket';
    if (s.includes('Scheduled')) return 'Planlagt';
    return s;
  }

  delay(): string {
    const f = this.flight();
    if (!f) return '';
    const sched = f.scheduledArrival ? new Date(f.scheduledArrival).getTime() : 0;
    const est = (f.estimatedArrival ? new Date(f.estimatedArrival).getTime() : 0) || sched;
    if (!sched || !est) return '';
    const diff = Math.round((est - sched) / 60_000);
    if (diff <= 5) return '';
    return `Forsinket ~${diff} min`;
  }
}
