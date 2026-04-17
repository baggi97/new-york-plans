import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
  isDark = signal(this.loadPreference());

  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem('nyc-dark-mode', JSON.stringify(next));
    this.applyTheme(next);
  }

  init() {
    this.applyTheme(this.isDark());
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
