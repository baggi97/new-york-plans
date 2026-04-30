import { Component, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="install-prompt" [class.install-prompt--ios]="isIos()">
        <svg class="install-prompt__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
          <line x1="12" y1="18" x2="12" y2="18.01" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div class="install-prompt__body">
          @if (isIos()) {
            <span class="install-prompt__text">
              Tilføj til hjemmeskærm: tryk
              <svg class="install-prompt__share-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              og vælg <strong>"Føj til hjemmeskærm"</strong>
            </span>
          } @else {
            <span class="install-prompt__text">Installér appen på din hjemmeskærm for nem adgang</span>
          }
        </div>
        <div class="install-prompt__actions">
          @if (!isIos()) {
            <button class="install-prompt__btn install-prompt__btn--accept" (click)="install()">Installér</button>
          }
          <button class="install-prompt__btn install-prompt__btn--dismiss" (click)="dismiss()">Luk</button>
        </div>
      </div>
    }
  `,
  styleUrl: './install-prompt.scss',
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  visible = signal(false);
  isIos = signal(false);

  private deferredPrompt: any = null;
  private beforeInstallHandler = (e: Event) => {
    e.preventDefault();
    this.deferredPrompt = e;
    this.showIfNotDismissed();
  };

  ngOnInit() {
    if (typeof window === 'undefined') return;

    if (this.isStandalone()) return;

    if (this.isIosDevice()) {
      this.isIos.set(true);
      this.showIfNotDismissed();
      return;
    }

    window.addEventListener('beforeinstallprompt', this.beforeInstallHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('beforeinstallprompt', this.beforeInstallHandler);
  }

  async install() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem('pwa-installed', '1');
    }
    this.deferredPrompt = null;
    this.visible.set(false);
  }

  dismiss() {
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    this.visible.set(false);
  }

  private showIfNotDismissed() {
    if (localStorage.getItem('pwa-installed')) return;
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }
    setTimeout(() => this.visible.set(true), 2000);
  }

  private isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  private isIosDevice(): boolean {
    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);
    return isIos && isSafari;
  }
}
