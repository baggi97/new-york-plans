import { Injectable, signal, computed } from '@angular/core';

export interface JournalEntry {
  id: string;
  dayId: number;
  imageData: string;
  caption: string;
  timestamp: number;
}

const DB_NAME = 'nyc-journal';
const STORE_NAME = 'entries';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class PhotoJournalService {
  entries = signal<JournalEntry[]>([]);
  private db: IDBDatabase | null = null;

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
    const all = await this.getAll();
    this.entries.set(all);
  }

  async addEntry(dayId: number, imageData: string, caption: string): Promise<JournalEntry> {
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      dayId,
      imageData,
      caption,
      timestamp: Date.now(),
    };
    await this.put(entry);
    this.entries.update(list => [...list, entry]);
    return entry;
  }

  async removeEntry(id: string) {
    await this.delete(id);
    this.entries.update(list => list.filter(e => e.id !== id));
  }

  async updateCaption(id: string, caption: string) {
    const entry = this.entries().find(e => e.id === id);
    if (!entry) return;
    const updated = { ...entry, caption };
    await this.put(updated);
    this.entries.update(list => list.map(e => e.id === id ? updated : e));
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

  private getAll(): Promise<JournalEntry[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private put(entry: JournalEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
