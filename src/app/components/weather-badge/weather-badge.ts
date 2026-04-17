import { Component, OnInit, inject } from '@angular/core';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-weather-badge',
  standalone: true,
  template: `
    @if (weather.allDays().length > 0) {
      <div class="weather">
        <h3 class="weather__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 18a5 5 0 00-2-9.54 7 7 0 00-13.46 2A4.5 4.5 0 003.5 18h13z"/></svg>
          Vejrudsigt NYC
        </h3>
        <div class="weather__days">
          @for (w of weather.allDays(); track w.date) {
            <div class="weather__day">
              <span class="weather__icon">{{ weather.icon(w.code) }}</span>
              <span class="weather__date">{{ formatDate(w.date) }}</span>
              <span class="weather__temp">{{ w.tempMin }}° / {{ w.tempMax }}°</span>
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './weather-badge.scss',
})
export class WeatherBadgeComponent implements OnInit {
  weather = inject(WeatherService);

  ngOnInit() {
    this.weather.load();
  }

  formatDate(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric' });
  }
}
