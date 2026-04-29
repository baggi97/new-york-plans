import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private permissionGranted = false;

  init() {
    if (!('Notification' in window)) return;
    this.permissionGranted = Notification.permission === 'granted';
    if (this.permissionGranted) {
      this.subscribeToPush();
    }
  }

  needsPermission(): boolean {
    if (!('Notification' in window)) return false;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    if (localStorage.getItem('notif-dismissed')) return false;
    return Notification.permission === 'default';
  }

  async requestAndSubscribe(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const perm = await Notification.requestPermission();
    this.permissionGranted = perm === 'granted';
    if (this.permissionGranted) {
      await this.subscribeToPush();
      return true;
    }
    return false;
  }

  dismissPrompt() {
    localStorage.setItem('notif-dismissed', '1');
  }

  showGeofence(title: string, body: string) {
    if (!this.permissionGranted) return;
    this.displayNotification(title, body);
  }

  checkAndNotify() {
    // Hardcoded scheduled notifications removed; push notifications are handled server-side
  }

  private async subscribeToPush() {
    const vapidKey = environment.vapidPublicKey;
    if (!vapidKey || vapidKey === 'VAPID_PUBLIC_KEY_PLACEHOLDER') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const applicationServerKey = this.urlBase64ToUint8Array(vapidKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      }

      await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch (err) {
      console.warn('Push subscription failed:', err);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  private displayNotification(title: string, body: string, url = '/') {
    const opts = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: { url },
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => reg.showNotification(title, opts))
        .catch(() => this.fallbackNotification(title, opts));
    } else {
      this.fallbackNotification(title, opts);
    }
  }

  private fallbackNotification(title: string, opts: NotificationOptions) {
    try { new Notification(title, opts); } catch { /* unsupported */ }
  }
}
