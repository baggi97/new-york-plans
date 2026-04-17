import { Injectable, signal, computed } from '@angular/core';
import { TRIP_DATA } from '../data/trip-data';

export interface DayWeather {
  date: string;
  tempMin: number;
  tempMax: number;
  code: number;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private weatherData = signal<DayWeather[]>([]);
  private loaded = false;

  private tripDates = TRIP_DATA.days.map(d => d.isoDate);

  byDate = computed(() => {
    const map = new Map<string, DayWeather>();
    for (const w of this.weatherData()) {
      map.set(w.date, w);
    }
    return map;
  });

  allDays = computed(() => this.weatherData());

  async load() {
    if (this.loaded) return;
    this.loaded = true;
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America%2FNew_York&start_date=' +
        this.tripDates[0] + '&end_date=' + this.tripDates[this.tripDates.length - 1]
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      this.weatherData.set(
        data.daily.time.map((date: string, i: number) => ({
          date,
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          code: data.daily.weather_code[i],
        }))
      );
    } catch {
      this.weatherData.set(
        this.tripDates.map(d => ({ date: d, tempMin: 10, tempMax: 17, code: 3 }))
      );
    }
  }

  icon(code: number): string {
    if (code <= 1) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  }

  label(code: number): string {
    if (code <= 1) return 'Sol';
    if (code <= 3) return 'Delvis skyet';
    if (code <= 48) return 'Overskyet';
    if (code <= 67) return 'Regn';
    if (code <= 77) return 'Sne';
    if (code <= 82) return 'Byger';
    return 'Torden';
  }
}
