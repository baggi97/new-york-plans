import { Injectable, signal, computed } from '@angular/core';

export interface JournalEntry {
  id: string;
  dayId: number;
  imageData: string;
  caption: string;
  timestamp: number;
}

const API = '/.netlify/functions/photos';
const DB_NAME = 'nyc-journal';
const STORE_NAME = 'entries';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class PhotoJournalService {
  entries = signal<JournalEntry[]>([]);
  private db: IDBDatabase | null = null;
  private pendingIds = new Set<string>();
  private localDirtyAt = 0;

  entriesByDay = computed(() => {
    const map = new Map<number, JournalEntry[]>();
    for (const e of this.entries()) {
      const list = map.get(e.dayId) ?? [];
      list.push(e);
      map.set(e.dayId, list);
    }
    return map;
  });

  async init() {
    this.db = await this.openDB();
    const cached = await this.getAllLocal();
    if (cached.length) {
      this.entries.set(cached);
    }
    this.syncFromServer();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.syncFromServer();
    });
    setInterval(() => {
      if (document.visibilityState === 'visible') this.syncFromServer();
    }, 20_000);
  }

  private async syncFromServer() {
    if (!navigator.onLine) return;
    if (this.pendingIds.size > 0) return;
    if (Date.now() - this.localDirtyAt < 5000) return;

    try {
      const res = await fetch(API);
      if (!res.ok) return;
      const remote: JournalEntry[] = await res.json();

      const local = this.entries();
      const remoteMap = new Map(remote.map(e => [e.id, e]));
      const localMap = new Map(local.map(e => [e.id, e]));

      // Merge: keep all remote entries + any local-only entries (not yet synced)
      const merged = [...remote];
      for (const entry of local) {
        if (!remoteMap.has(entry.id)) {
          merged.push(entry);
        }
      }

      merged.sort((a, b) => a.timestamp - b.timestamp);

      const hasChanged = merged.length !== local.length ||
        merged.some((e, i) => e.id !== local[i]?.id);

      if (hasChanged) {
        this.entries.set(merged);
        await this.replaceAllLocal(merged);
      }
    } catch { /* offline or server error -- use cache */ }
  }

  async addEntry(dayId: number, imageData: string, caption: string): Promise<JournalEntry> {
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      dayId,
      imageData,
      caption,
      timestamp: Date.now(),
    };

    this.pendingIds.add(entry.id);
    this.localDirtyAt = Date.now();
    this.entries.update(list => [...list, entry]);
    await this.putLocal(entry);

    if (navigator.onLine) {
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dayId, imageData, caption }),
        });
        if (res.ok) {
          const serverEntry: JournalEntry = await res.json();
          await this.putLocal(serverEntry);
          await this.deleteLocal(entry.id);
          this.entries.update(list =>
            list.map(e => e.id === entry.id ? serverEntry : e)
          );
          this.pendingIds.delete(entry.id);
          return serverEntry;
        }
      } catch { /* keep local version */ }
    }

    this.pendingIds.delete(entry.id);
    return entry;
  }

  async removeEntry(id: string) {
    this.localDirtyAt = Date.now();
    this.entries.update(list => list.filter(e => e.id !== id));
    await this.deleteLocal(id);

    if (navigator.onLine) {
      try {
        await fetch(`${API}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch { /* best effort */ }
    }
  }

  async updateCaption(id: string, caption: string) {
    const entry = this.entries().find(e => e.id === id);
    if (!entry) return;
    this.localDirtyAt = Date.now();
    const updated = { ...entry, caption };
    this.entries.update(list => list.map(e => e.id === id ? updated : e));
    await this.putLocal(updated);

    if (navigator.onLine) {
      try {
        await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, caption }),
        });
      } catch { /* best effort */ }
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private getAllLocal(): Promise<JournalEntry[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private putLocal(entry: JournalEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private deleteLocal(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private async replaceAllLocal(entries: JournalEntry[]): Promise<void> {
    if (!this.db) return;
    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const e of entries) {
      store.put(e);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
