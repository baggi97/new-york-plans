import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
  isDark = signal(this.loadPreference());
  private listeners: Array<(dark: boolean) => void> = [];

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem('nyc-dark-mode', JSON.stringify(next));
    this.applyTheme(next);
    this.listeners.forEach(fn => fn(next));
  }

  init() {
    this.applyTheme(this.isDark());
  }

  onChange(fn: (dark: boolean) => void) {
    this.listeners.push(fn);
  }

  private loadPreference(): boolean {
    try {
      const stored = localStorage.getItem('nyc-dark-mode');
      if (stored !== null) return JSON.parse(stored);
    } catch { /* ignore */ }
    return false;
  }

  private applyTheme(dark: boolean) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}
