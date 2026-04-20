import { Injectable, signal } from '@angular/core';

export interface GeoPos {
  lat: number;
  lng: number;
}

export function haversineMeters(a: GeoPos, b: GeoPos): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  position = signal<GeoPos | null>(null);
  error = signal<string | null>(null);
  private watchId?: number;

  start() {
    if (this.watchId != null) return;
    if (!('geolocation' in navigator)) {
      this.error.set('Geolocation ikke understøttet');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        this.position.set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        this.error.set(null);
      },
      err => this.error.set(err.message),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );
  }

  stop() {
    if (this.watchId != null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = undefined;
    }
  }
}
