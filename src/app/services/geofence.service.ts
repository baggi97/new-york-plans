import { Injectable, inject, effect } from '@angular/core';
import { GeolocationService, haversineMeters } from './geolocation.service';
import { TripStatusService } from './trip-status.service';
import { NotificationService } from './notification.service';
import { TripService } from './trip.service';

const RADIUS_M = 200;

@Injectable({ providedIn: 'root' })
export class GeofenceService {
  private geo = inject(GeolocationService);
  private tripStatus = inject(TripStatusService);
  private notifications = inject(NotificationService);
  private tripService = inject(TripService);

  private get lsPrefix() { return this.tripService.tripId() + '-geofence-'; }
  private triggered = new Set<string>(this.loadTriggered());

  init() {
    if (this.tripStatus.status() !== 'during') return;
    this.geo.start();

    effect(() => {
      const pos = this.geo.position();
      if (!pos) return;
      this.checkProximity(pos);
    });
  }

  private checkProximity(pos: { lat: number; lng: number }) {
    const dayNum = this.tripStatus.currentDayNumber();
    if (dayNum === 0) return;

    const day = this.tripService.days().find(d => d.id === dayNum);
    if (!day) return;

    for (const marker of day.markers) {
      const key = `${dayNum}-${marker.label}`;
      if (this.triggered.has(key)) continue;

      const dist = haversineMeters(pos, marker);
      if (dist <= RADIUS_M) {
        this.triggered.add(key);
        this.saveTriggered();

        const tip = day.tips?.find(t =>
          t.toLowerCase().includes(marker.label.toLowerCase().split(' ')[0])
        );
        const body = tip || `I er tæt på ${marker.label}!`;
        this.notifications.showGeofence(`📍 ${marker.label}`, body);
      }
    }
  }

  private loadTriggered(): string[] {
    try {
      const raw = localStorage.getItem(this.lsPrefix + 'triggered');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private saveTriggered() {
    localStorage.setItem(this.lsPrefix + 'triggered', JSON.stringify([...this.triggered]));
  }
}
