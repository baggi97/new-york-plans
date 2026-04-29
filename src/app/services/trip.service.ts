import { Injectable, signal, computed } from '@angular/core';
import { TripData, TripDay, TripDestination, PracticalInfo } from '../data/trip.interfaces';
import { TRIP_DATA } from '../data/trip-data';

export interface TripMeta {
  id: string;
  title: string;
  city: string;
  dates: string;
}

const LS_ACTIVE_TRIP = 'active-trip-id';
const API = '/.netlify/functions/trips';

@Injectable({ providedIn: 'root' })
export class TripService {
  activeTrip = signal<TripData>(TRIP_DATA);
  trips = signal<TripMeta[]>([]);
  loading = signal(false);

  trip = computed(() => this.activeTrip());
  days = computed(() => this.activeTrip().days);
  destination = computed(() => this.activeTrip().destination);
  practicalInfo = computed(() => this.activeTrip().practicalInfo);
  destTz = computed(() => this.activeTrip().destination.timezone);
  homeTz = computed(() => this.activeTrip().homeTimezone);
  tripId = computed(() => this.activeTrip().id);

  async init() {
    await this.loadTrips();
    const savedId = localStorage.getItem(LS_ACTIVE_TRIP);
    if (savedId && savedId !== this.activeTrip().id) {
      await this.selectTrip(savedId);
    }
  }

  async loadTrips() {
    try {
      const res = await fetch(API);
      if (!res.ok) return;
      const list: TripMeta[] = await res.json();
      this.trips.set(list);
      if (list.length === 0) {
        await this.saveTrip(TRIP_DATA);
        this.trips.set([{
          id: TRIP_DATA.id,
          title: TRIP_DATA.title,
          city: TRIP_DATA.destination.city,
          dates: TRIP_DATA.dates,
        }]);
      }
    } catch { /* offline -- use default */ }
  }

  async selectTrip(id: string) {
    if (id === this.activeTrip().id) return;
    this.loading.set(true);
    try {
      const res = await fetch(`${API}?id=${encodeURIComponent(id)}`);
      if (!res.ok) return;
      const trip: TripData = await res.json();
      this.activeTrip.set(trip);
      localStorage.setItem(LS_ACTIVE_TRIP, id);
    } catch { /* offline */ } finally {
      this.loading.set(false);
    }
  }

  async saveTrip(trip: TripData) {
    try {
      await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
    } catch { /* best effort */ }
  }

  async deleteTrip(id: string) {
    try {
      await fetch(`${API}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      this.trips.update(list => list.filter(t => t.id !== id));
      if (this.activeTrip().id === id) {
        this.activeTrip.set(TRIP_DATA);
        localStorage.removeItem(LS_ACTIVE_TRIP);
      }
    } catch { /* best effort */ }
  }
}
