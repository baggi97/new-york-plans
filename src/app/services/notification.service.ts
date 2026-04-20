import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface TripNotification {
  id: string;
  date: string;
  afterHour: number;
  beforeHour: number;
  tz: string;
  title: string;
  body: string;
  url: string;
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

const DK = 'Europe/Copenhagen';
const NY = 'America/New_York';

const NOTIFICATIONS: TripNotification[] = [
  // Aften d. 20-21 apr: dansk tid (brugeren er i DK)
  { id: 'eve-0420', date: '2026-04-20', afterHour: 21, beforeHour: 23, tz: DK, title: 'Om 2 dage!', body: 'I overmorgen letter SAS SK909 mod New York. Tjek pakkelisten og glæd dig — snart står I i Times Square!', url: '/#praktisk' },
  { id: 'eve-0421', date: '2026-04-21', afterHour: 21, beforeHour: 23, tz: DK, title: 'Klar til New York?', body: 'Tjek pakkelisten og hav boardingpass klar. SAS SK909 afgår i morgen kl. 10:25. Husk pas, GoCity-app og komfortable sko!', url: '/#praktisk' },
  // Aften d. 22-26 apr: NY-tid (brugeren er i NY)
  { id: 'eve-0422', date: '2026-04-22', afterHour: 18, beforeHour: 23, tz: NY, title: 'I morgen: DUMBO, Brooklyn Bridge og 9/11', body: 'Start i DUMBO med udsigt til Manhattan Bridge. Gå over Brooklyn Bridge, besøg 9/11 Museum (husk GoCity) og afslut med Mets-kamp på Citi Field. ~14 km', url: '/#dag-2' },
  { id: 'eve-0423', date: '2026-04-23', afterHour: 18, beforeHour: 23, tz: NY, title: 'I morgen: Central Park og Top of the Rock', body: 'Morgenmad på Ess-a-Bagel, derefter Central Park (Bethesda Fountain, Bow Bridge). Roosevelt Island Tram om eftermiddagen. Top of the Rock kl. 19 — perfekt til solnedgang', url: '/#dag-3' },
  { id: 'eve-0424', date: '2026-04-24', afterHour: 18, beforeHour: 23, tz: NY, title: 'I morgen: Chinatown, SoHo og DUMBO', body: "Brunch på Bubby's, så Chinatown og Little Italy. Katz's Delicatessen til frokost (bestil ved disken — mist IKKE din billet!). SoHo-shopping og afslut i DUMBO ved solnedgang", url: '/#dag-4' },
  { id: 'eve-0425', date: '2026-04-25', afterHour: 18, beforeHour: 23, tz: NY, title: 'I morgen: Midtown og Empire State', body: 'Grand Central Terminal, Fifth Avenue, High Line og Chelsea Market. Empire State Building kl. 21:15 — magisk udsigt om aftenen. ~12 km', url: '/#dag-5' },
  { id: 'eve-0426', date: '2026-04-26', afterHour: 18, beforeHour: 23, tz: NY, title: 'Sidste morgen i NYC', body: 'Pak i aften så morgenen er stressfri. Sunday brunch, sidste gåtur, så Penn Station til Newark. Vær i lufthavnen senest kl. 14:15. SAS SK910 kl. 17:15', url: '/#dag-6' },
  // Morgen d. 22-27 apr: NY-tid
  { id: 'morn-0422', date: '2026-04-22', afterHour: 5, beforeHour: 12, tz: NY, title: 'God rejse!', body: 'SAS SK909 lander i Newark ca. 14:55. Tag AirTrain + NJ Transit til Penn Station (~1 time). Check-in på Millennium Hotel og nyd Times Square i aftenlyset', url: '/#dag-1' },
  { id: 'morn-0423', date: '2026-04-23', afterHour: 5, beforeHour: 12, tz: NY, title: 'God morgen, dag 2!', body: 'Subway N/R til DUMBO for Manhattan Bridge-udsigten. Gå over Brooklyn Bridge og besøg 9/11 Museum. I aften: Mets på Citi Field — tag 7-toget fra Times Sq', url: '/#dag-2' },
  { id: 'morn-0424', date: '2026-04-24', afterHour: 5, beforeHour: 12, tz: NY, title: 'God morgen, dag 3!', body: 'Ess-a-Bagel til morgenmad, derefter Central Park. Prøv Roosevelt Island Tram — fantastisk udsigt! Husk Top of the Rock kl. 19', url: '/#dag-3' },
  { id: 'morn-0425', date: '2026-04-25', afterHour: 5, beforeHour: 12, tz: NY, title: 'God morgen, dag 4!', body: "Bubby's i TriBeCa venter med brunch! Derefter Chinatown, Katz's og SoHo. Afslut i DUMBO med Brooklyn Bridge-udsigt", url: '/#dag-4' },
  { id: 'morn-0426', date: '2026-04-26', afterHour: 5, beforeHour: 12, tz: NY, title: 'God morgen, dag 5!', body: 'Grand Central Terminal og Fifth Avenue i dag. Slut af med High Line og Chelsea Market. Empire State Building kl. 21:15 — tag kameraet med!', url: '/#dag-5' },
  { id: 'morn-0427', date: '2026-04-27', afterHour: 5, beforeHour: 12, tz: NY, title: 'Sidste dag!', body: 'Nyd brunch på Sunday Morning. Pak de sidste ting og tag NJ Transit + AirTrain til Newark. SAS SK910 afgår kl. 17:15 — vær der senest kl. 14:15', url: '/#dag-6' },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private permissionGranted = false;

  init() {
    if (!('Notification' in window)) return;
    this.permissionGranted = Notification.permission === 'granted';
    if (this.permissionGranted) {
      this.subscribeToPush();
    }
    this.checkAndNotify();
  }

  needsPermission(): boolean {
    if (!('Notification' in window)) return false;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    if (localStorage.getItem('nyc-notif-dismissed')) return false;
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
    localStorage.setItem('nyc-notif-dismissed', '1');
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

  checkAndNotify() {
    if (!('Notification' in window)) return;

    const now = new Date();
    const tzCache = new Map<string, { date: string; hour: number }>();
    const getLocalTime = (tz: string) => {
      if (!tzCache.has(tz)) {
        const date = new Intl.DateTimeFormat('en-CA', {
          timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(now);
        const hour = parseInt(new Intl.DateTimeFormat('en-US', {
          timeZone: tz, hour: 'numeric', hour12: false,
        }).format(now), 10);
        tzCache.set(tz, { date, hour });
      }
      return tzCache.get(tz)!;
    };

    const pending = NOTIFICATIONS.filter(n => {
      const { date, hour } = getLocalTime(n.tz);
      return n.date === date &&
        hour >= n.afterHour &&
        hour < n.beforeHour &&
        !localStorage.getItem(`nyc-notif-${n.id}`);
    });

    if (pending.length === 0) {
      this.checkTeaseNotification();
      return;
    }

    if (this.permissionGranted) {
      pending.forEach(n => this.show(n));
    }
  }

  private checkTeaseNotification() {
    if (!this.permissionGranted) return;

    const now = new Date();
    if (now >= TEASE_DEADLINE) return;

    const last = localStorage.getItem('nyc-tease-last');
    if (last && now.getTime() - new Date(last).getTime() < TEASE_THROTTLE_MS) return;

    const msg = TEASE_MESSAGES[Math.floor(Math.random() * TEASE_MESSAGES.length)];
    this.showTease(msg);
  }

  private showTease(msg: { title: string; body: string }) {
    this.displayNotification(msg.title, msg.body);
    localStorage.setItem('nyc-tease-last', new Date().toISOString());
  }

  private show(n: TripNotification) {
    this.displayNotification(n.title, n.body, n.url);
    localStorage.setItem(`nyc-notif-${n.id}`, '1');
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
