import { Component, Input, inject, computed } from '@angular/core';
import { TripDay } from '../../data/trip.interfaces';
import { ItineraryCheckService } from '../../services/itinerary-check.service';
import { PhotoJournalService } from '../../services/photo-journal.service';
import { WeatherService } from '../../services/weather.service';
import { TripStatusService } from '../../services/trip-status.service';

@Component({
  selector: 'app-daily-recap',
  standalone: true,
  template: `
    @if (isPast()) {
      <div class="recap">
        <h3 class="recap__title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
          Dagsoverblik
        </h3>
        <div class="recap__stats">
          <div class="recap__stat">
            <span class="recap__stat-value">{{ progress().done }} / {{ progress().total }}</span>
            <span class="recap__stat-label">Gennemført</span>
          </div>
          <div class="recap__stat">
            <span class="recap__stat-value">{{ photoCount() }}</span>
            <span class="recap__stat-label">Fotos</span>
          </div>
          @if (day.walkingDistance) {
            <div class="recap__stat">
              <span class="recap__stat-value">{{ day.walkingDistance }}</span>
              <span class="recap__stat-label">Gået</span>
            </div>
          }
          @if (weather()) {
            <div class="recap__stat">
              <span class="recap__stat-value">{{ weatherService.icon(weather()!.code) }} {{ weather()!.tempMax }}°</span>
              <span class="recap__stat-label">Vejr</span>
            </div>
          }
        </div>
        <button class="recap__share" (click)="share()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Del recap
        </button>
      </div>
    }
  `,
  styleUrl: './daily-recap.scss',
})
export class DailyRecapComponent {
  @Input({ required: true }) day!: TripDay;

  private tripStatus = inject(TripStatusService);
  private itinerary = inject(ItineraryCheckService);
  private journal = inject(PhotoJournalService);
  weatherService = inject(WeatherService);

  isPast = computed(() => {
    const current = this.tripStatus.currentDayNumber();
    const status = this.tripStatus.status();
    return status === 'after' || (status === 'during' && this.day.id < current);
  });

  progress = computed(() => this.itinerary.dayProgress(this.day.id));

  photoCount = computed(() => {
    return this.journal.entries().filter(e => e.dayId === this.day.id).length;
  });

  weather = computed(() => {
    return this.weatherService.byDate().get(this.day.isoDate) ?? null;
  });

  async share() {
    const p = this.progress();
    const text = [
      `Dag ${this.day.id}: ${this.day.title}`,
      `${p.done}/${p.total} gennemført`,
      this.day.walkingDistance ? `${this.day.walkingDistance} gået` : '',
      `${this.photoCount()} fotos taget`,
    ].filter(Boolean).join(' · ');

    if (navigator.share) {
      try { await navigator.share({ title: `NYC Dag ${this.day.id} recap`, text }); }
      catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }
}
