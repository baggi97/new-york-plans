import { Injectable, signal, NgZone, inject, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService implements OnDestroy {
  private zone = inject(NgZone);

  isOnline = signal(navigator.onLine);
  private callbacks: Array<() => void> = [];

  private onOnline = () => this.zone.run(() => {
    this.isOnline.set(true);
    for (const cb of this.callbacks) cb();
  });

  private onOffline = () => this.zone.run(() => {
    this.isOnline.set(false);
  });

  constructor() {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }

  onReconnect(callback: () => void) {
    this.callbacks.push(callback);
  }
}
