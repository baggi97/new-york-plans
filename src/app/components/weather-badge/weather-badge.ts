import { Component, OnInit, signal } from '@angular/core';
import { TRIP_DATA } from '../../data/trip-data';

interface DayWeather {
  date: string;
  tempMin: number;
  tempMax: number;
  code: number;
}

@Component({
  selector: 'app-weather-badge',
  standalone: true,
  template: `
    @if (weather().length > 0) {
      <div class="weather">
        <h3 class="weather__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 18a5 5 0 00-2-9.54 7 7 0 00-13.46 2A4.5 4.5 0 003.5 18h13z"/></svg>
          Vejrudsigt NYC
        </h3>
        <div class="weather__days">
          @for (w of weather(); track w.date) {
            <div class="weather__day">
              <span class="weather__icon">{{ weatherIcon(w.code) }}</span>
              <span class="weather__date">{{ formatDate(w.date) }}</span>
              <span class="weather__temp">{{ w.tempMin }}° / {{ w.tempMax }}°</span>
            </div>
          }
        </div>
        @if (isOffline()) {
          <span class="weather__offline">Typisk april: 10-17°C, delvis skyet</span>
        }
      </div>
    }
  `,
  styleUrl: './weather-badge.scss',
})
export class WeatherBadgeComponent implements OnInit {
  weather = signal<DayWeather[]>([]);
  isOffline = signal(false);

  private tripDates = TRIP_DATA.days.map(d => d.isoDate);

  ngOnInit() {
    this.fetchWeather();
  }

  async fetchWeather() {
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America%2FNew_York&start_date=' +
        this.tripDates[0] + '&end_date=' + this.tripDates[this.tripDates.length - 1]
      );
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();
      const days: DayWeather[] = data.daily.time.map((date: string, i: number) => ({
        date,
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        code: data.daily.weather_code[i],
      }));
      this.weather.set(days);
    } catch {
      this.isOffline.set(true);
      this.weather.set(this.tripDates.map(d => ({
        date: d, tempMin: 10, tempMax: 17, code: 3,
      })));
    }
  }

  weatherIcon(code: number): string {
    if (code <= 1) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  }

  formatDate(iso: string): string {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric' });
  }
}
