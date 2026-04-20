import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface TripNotification {
  id: string;
  date: string;
  afterHour: number;
  beforeHour: number;
  title: string;
  body: string;
}

const TEASE_MESSAGES: { title: string; body: string }[] = [
  { title: 'Igen allerede?', body: 'New York løber ikke væk — men vi forstår dig!' },
  { title: 'Kunne du ikke vente?', body: 'Rolig nu, der er stadig et par dage til afgang' },
  { title: 'Hov hov!', body: 'Du har allerede tjekket planen — men vi elsker entusiasmen!' },
  { title: 'Tålmodig er du ikke...', body: 'Men det er også en fed rejse, så fair nok' },
  { title: 'Du igen?', body: 'Tip: Scroll ned til pakkelisten og få styr på kufferten' },
  { title: 'Så utålmodig!', body: 'Slap af — planen ændrer sig ikke før I lander' },
];

const TEASE_DEADLINE = new Date('2026-04-21T18:00:00+02:00');
const TEASE_THROTTLE_MS = 60 * 60 * 1000;

const NOTIFICATIONS: TripNotification[] = [
  // Aften-notifikationer (18-23)
  { id: 'eve-0421', date: '2026-04-21', afterHour: 18, beforeHour: 23, title: 'Klar til New York?', body: 'Tjek pakkelisten og hav boardingpass klar. SAS SK909 afgår i morgen!' },
  { id: 'eve-0422', date: '2026-04-22', afterHour: 18, beforeHour: 23, title: 'I morgen: Brooklyn + 9/11', body: 'Husk GoCity-appen til 9/11 Museum' },
  { id: 'eve-0423', date: '2026-04-23', afterHour: 18, beforeHour: 23, title: 'I morgen: Central Park + Top of the Rock', body: 'Top of the Rock er booket kl. 19 — perfekt til solnedgang' },
  { id: 'eve-0424', date: '2026-04-24', afterHour: 18, beforeHour: 23, title: 'I morgen: Chinatown + SoHo + DUMBO', body: "Katz's: Bestil ved disken og mist IKKE din billet!" },
  { id: 'eve-0425', date: '2026-04-25', afterHour: 18, beforeHour: 23, title: 'I morgen: Midtown + Empire State', body: 'Empire State Building kl. 21:15 — magisk udsigt over byen om aftenen' },
  { id: 'eve-0426', date: '2026-04-26', afterHour: 18, beforeHour: 23, title: 'Sidste morgen i NYC', body: 'Pak aftenen før så morgenen er stressfri. Vær i lufthavnen senest kl. 14:15' },

  // Morgen-notifikationer (5-12)
  { id: 'morn-0422', date: '2026-04-22', afterHour: 5, beforeHour: 12, title: 'God rejse!', body: 'SAS SK909 lander i Newark ca. 14:55' },
  { id: 'morn-0423', date: '2026-04-23', afterHour: 5, beforeHour: 12, title: 'God morgen, dag 2!', body: 'Start med subway til DUMBO og nyd Manhattan Bridge-udsigten' },
  { id: 'morn-0424', date: '2026-04-24', afterHour: 5, beforeHour: 12, title: 'God morgen, dag 3!', body: 'Ess-a-Bagel eller H&H Bagels til morgenmad, derefter Central Park' },
  { id: 'morn-0425', date: '2026-04-25', afterHour: 5, beforeHour: 12, title: 'God morgen, dag 4!', body: "Bubby's i TriBeCa venter med brunch!" },
  { id: 'morn-0426', date: '2026-04-26', afterHour: 5, beforeHour: 12, title: 'God morgen, dag 5!', body: 'Grand Central Terminal og Fifth Avenue i dag' },
  { id: 'morn-0427', date: '2026-04-27', afterHour: 5, beforeHour: 12, title: 'Sidste dag!', body: 'Nyd Sunday Morning brunch. Penn Station → Newark med NJ Transit + AirTrain' },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private permissionGranted = false;

  init() {
    if (!('Notification' in window)) return;
    this.permissionGranted = Notification.permission === 'granted';
    this.subscribeToPush();
    this.checkAndNotify();
  }

  private async subscribeToPush() {
    const vapidKey = environment.vapidPublicKey;
    if (!vapidKey || vapidKey === 'VAPID_PUBLIC_KEY_PLACEHOLDER') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        if (Notification.permission === 'denied') return;
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') return;
          this.permissionGranted = true;
        }

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

  checkAndNotify() {
    if (!('Notification' in window)) return;

    const now = new Date();
    const nyFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const nyHourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric', hour12: false,
    });

    const nyDate = nyFormatter.format(now);
    const nyHour = parseInt(nyHourFormatter.format(now), 10);

    const pending = NOTIFICATIONS.filter(n =>
      n.date === nyDate &&
      nyHour >= n.afterHour &&
      nyHour < n.beforeHour &&
      !localStorage.getItem(`nyc-notif-${n.id}`)
    );

    if (pending.length === 0) {
      this.checkTeaseNotification();
      return;
    }

    if (this.permissionGranted) {
      pending.forEach(n => this.show(n));
      return;
    }

    if (Notification.permission === 'denied') return;

    Notification.requestPermission().then(perm => {
      this.permissionGranted = perm === 'granted';
      if (this.permissionGranted) {
        pending.forEach(n => this.show(n));
      }
    });
  }

  private checkTeaseNotification() {
    const now = new Date();
    if (now >= TEASE_DEADLINE) return;

    const last = localStorage.getItem('nyc-tease-last');
    if (last && now.getTime() - new Date(last).getTime() < TEASE_THROTTLE_MS) return;

    const msg = TEASE_MESSAGES[Math.floor(Math.random() * TEASE_MESSAGES.length)];

    if (this.permissionGranted) {
      this.showTease(msg);
      return;
    }

    if (Notification.permission === 'denied') return;

    Notification.requestPermission().then(perm => {
      this.permissionGranted = perm === 'granted';
      if (this.permissionGranted) {
        this.showTease(msg);
      }
    });
  }

  private showTease(msg: { title: string; body: string }) {
    this.displayNotification(msg.title, msg.body);
    localStorage.setItem('nyc-tease-last', new Date().toISOString());
  }

  private show(n: TripNotification) {
    this.displayNotification(n.title, n.body);
    localStorage.setItem(`nyc-notif-${n.id}`, '1');
  }

  private displayNotification(title: string, body: string) {
    const opts = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
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
