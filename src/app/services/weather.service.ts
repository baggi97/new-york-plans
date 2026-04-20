import { Injectable, signal, computed, inject } from '@angular/core';
import { TRIP_DATA } from '../data/trip-data';
import { ConnectivityService } from './connectivity.service';

export interface DayWeather {
  date: string;
  tempMin: number;
  tempMax: number;
  feelsMin: number;
  feelsMax: number;
  code: number;
  precipitation: number;
  precipProbability: number;
  windSpeed: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private connectivity = inject(ConnectivityService);
  private weatherData = signal<DayWeather[]>([]);
  private hasFetched = false;

  private tripDates = TRIP_DATA.days.map(d => d.isoDate);

  byDate = computed(() => {
    const map = new Map<string, DayWeather>();
    for (const w of this.weatherData()) {
      map.set(w.date, w);
    }
    return map;
  });

  allDays = computed(() => this.weatherData());

  constructor() {
    this.connectivity.onReconnect(() => this.reload());
  }

  async load() {
    if (this.hasFetched) return;
    await this.fetchData();
  }

  async reload() {
    this.hasFetched = false;
    await this.fetchData();
  }

  private async fetchData() {
    this.hasFetched = true;
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006' +
        '&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,weather_code,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset' +
        '&wind_speed_unit=ms&timezone=America%2FNew_York&start_date=' +
        this.tripDates[0] + '&end_date=' + this.tripDates[this.tripDates.length - 1]
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const d = data.daily;
      this.weatherData.set(
        d.time.map((date: string, i: number) => ({
          date,
          tempMin: Math.round(d.temperature_2m_min[i]),
          tempMax: Math.round(d.temperature_2m_max[i]),
          feelsMin: Math.round(d.apparent_temperature_min[i]),
          feelsMax: Math.round(d.apparent_temperature_max[i]),
          code: d.weather_code[i],
          precipitation: Math.round(d.precipitation_sum[i] * 10) / 10,
          precipProbability: Math.round(d.precipitation_probability_max[i]),
          windSpeed: Math.round(d.wind_speed_10m_max[i]),
          uvIndex: Math.round(d.uv_index_max[i] * 10) / 10,
          sunrise: (d.sunrise[i] as string).slice(11, 16),
          sunset: (d.sunset[i] as string).slice(11, 16),
        }))
      );
    } catch {
      if (this.weatherData().length === 0) {
        this.weatherData.set(
          this.tripDates.map(d => ({
            date: d, tempMin: 10, tempMax: 17, feelsMin: 8, feelsMax: 15,
            code: 3, precipitation: 0, precipProbability: 0,
            windSpeed: 3, uvIndex: 4, sunrise: '06:10', sunset: '19:45',
          }))
        );
      }
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

  uvLabel(index: number): string {
    if (index < 3) return 'Lav';
    if (index < 6) return 'Moderat';
    if (index < 8) return 'Høj';
    if (index < 11) return 'Meget høj';
    return 'Ekstrem';
  }
}
