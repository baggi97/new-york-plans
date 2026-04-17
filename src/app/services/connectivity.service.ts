import { Injectable, signal, NgZone, inject, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService implements OnDestroy {
  private zone = inject(NgZone);

  isOnline = signal(navigator.onLine);
  private reconnectCallbacks: Array<() => void> = [];
  private disconnectCallbacks: Array<() => void> = [];

  private onOnline = () => this.zone.run(() => {
    this.isOnline.set(true);
    for (const cb of this.reconnectCallbacks) cb();
  });

  private onOffline = () => this.zone.run(() => {
    this.isOnline.set(false);
    for (const cb of this.disconnectCallbacks) cb();
  });

  constructor() {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);

    if (navigator.onLine) {
      fetch('/favicon.svg', { method: 'HEAD', cache: 'no-store' })
        .catch(() => {
          this.zone.run(() => this.isOnline.set(false));
        });
    }
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }

  onReconnect(callback: () => void) {
    this.reconnectCallbacks.push(callback);
  }

  onDisconnect(callback: () => void) {
    this.disconnectCallbacks.push(callback);
  }
}
