import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { TripService } from './trip.service';
import { ConnectivityService } from './connectivity.service';
import { TripDestination } from '../data/trip.interfaces';

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
  /** true when the value is a typical estimate (last year's actuals) rather than a live forecast */
  estimated?: boolean;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private connectivity = inject(ConnectivityService);
  private tripService = inject(TripService);
  private weatherData = signal<DayWeather[]>([]);
  private hasFetched = false;
  private fetchedForTrip = '';

  private get tripDates() { return this.tripService.days().map(d => d.isoDate); }

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
    effect(() => {
      const id = this.tripService.tripId();
      if (id !== this.fetchedForTrip && this.hasFetched) {
        this.reload();
      }
    });
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
    this.fetchedForTrip = this.tripService.tripId();
    this.weatherData.set([]);

    const dest = this.tripService.destination();
    const dates = this.tripDates;
    if (dates.length === 0) return;

    const tripStart = dates[0];
    const tripEnd = dates[dates.length - 1];
    const results = new Map<string, DayWeather>();

    // 1) Live forecast for trip days inside Open-Meteo's ~16-day forecast window.
    const forecastCap = this.shiftDays(this.todayIso(), 15);
    if (tripStart <= forecastCap) {
      const fcEnd = tripEnd < forecastCap ? tripEnd : forecastCap;
      try {
        const rows = await this.fetchDaily(
          'https://api.open-meteo.com/v1/forecast', dest, tripStart, fcEnd, true,
        );
        for (const r of rows) results.set(r.date, r);
      } catch { /* fall through to historical estimate */ }
    }

    // 2) Days beyond the forecast horizon: use last year's actuals as a typical estimate.
    const missing = dates.filter(d => !results.has(d));
    if (missing.length > 0) {
      try {
        const rows = await this.fetchDaily(
          'https://archive-api.open-meteo.com/v1/archive', dest,
          this.shiftYear(tripStart, -1), this.shiftYear(tripEnd, -1), false,
        );
        for (const r of rows) {
          const date = this.shiftYear(r.date, 1);
          if (results.has(date)) continue;
          results.set(date, { ...r, date, estimated: true });
        }
      } catch { /* ignore -- some days may remain without data */ }
    }

    const ordered = dates
      .map(d => results.get(d))
      .filter((w): w is DayWeather => !!w);

    if (ordered.length > 0) {
      this.weatherData.set(ordered);
    } else if (this.weatherData().length === 0) {
      // Last-resort placeholder only if every network call failed (e.g. offline).
      this.weatherData.set(
        dates.map(d => ({
          date: d, tempMin: 10, tempMax: 17, feelsMin: 8, feelsMax: 15,
          code: 3, precipitation: 0, precipProbability: 0,
          windSpeed: 3, uvIndex: 4, sunrise: '06:10', sunset: '19:45', estimated: true,
        }))
      );
    }
  }

  private async fetchDaily(
    base: string, dest: TripDestination,
    startDate: string, endDate: string, hasProbability: boolean,
  ): Promise<DayWeather[]> {
    const daily = [
      'temperature_2m_max', 'temperature_2m_min',
      'apparent_temperature_max', 'apparent_temperature_min',
      'weather_code', 'precipitation_sum',
      ...(hasProbability ? ['precipitation_probability_max'] : []),
      'wind_speed_10m_max', 'uv_index_max', 'sunrise', 'sunset',
    ].join(',');

    const res = await fetch(
      `${base}?latitude=${dest.lat}&longitude=${dest.lng}&daily=${daily}` +
      `&wind_speed_unit=ms&timezone=${encodeURIComponent(dest.timezone)}` +
      `&start_date=${startDate}&end_date=${endDate}`,
    );
    if (!res.ok) throw new Error('weather fetch failed');
    const data = await res.json();
    const d = data.daily;
    return (d.time as string[]).map((date, i) => ({
      date,
      tempMin: Math.round(d.temperature_2m_min[i]),
      tempMax: Math.round(d.temperature_2m_max[i]),
      feelsMin: Math.round(d.apparent_temperature_min[i]),
      feelsMax: Math.round(d.apparent_temperature_max[i]),
      code: d.weather_code[i],
      precipitation: Math.round(d.precipitation_sum[i] * 10) / 10,
      precipProbability: hasProbability ? Math.round(d.precipitation_probability_max[i]) : 0,
      windSpeed: Math.round(d.wind_speed_10m_max[i]),
      uvIndex: d.uv_index_max[i] != null ? Math.round(d.uv_index_max[i] * 10) / 10 : 0,
      sunrise: (d.sunrise[i] as string).slice(11, 16),
      sunset: (d.sunset[i] as string).slice(11, 16),
    }));
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private shiftDays(iso: string, days: number): string {
    const dt = new Date(iso + 'T00:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + days);
    return dt.toISOString().slice(0, 10);
  }

  private shiftYear(iso: string, delta: number): string {
    return (parseInt(iso.slice(0, 4), 10) + delta) + iso.slice(4);
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
