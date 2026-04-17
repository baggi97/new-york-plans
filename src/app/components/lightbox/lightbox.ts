import { Component, inject, HostListener } from '@angular/core';
import { LightboxService } from '../../services/lightbox.service';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  template: `
    @if (lightbox.isOpen()) {
      <div class="lightbox" (click)="lightbox.close()">
        <button class="lightbox__close" aria-label="Luk">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <button class="lightbox__nav lightbox__nav--prev" (click)="onPrev($event)" aria-label="Forrige">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="lightbox__image-wrap" (click)="$event.stopPropagation()">
          <img [src]="currentImage.url" [alt]="currentImage.alt" />
          @if (currentImage.alt) {
            <p class="lightbox__caption">{{ currentImage.alt }}</p>
          }
          <span class="lightbox__counter">{{ lightbox.currentIndex() + 1 }} / {{ lightbox.images().length }}</span>
        </div>

        <button class="lightbox__nav lightbox__nav--next" (click)="onNext($event)" aria-label="Næste">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    }
  `,
  styleUrl: './lightbox.scss',
})
export class LightboxComponent {
  lightbox = inject(LightboxService);

  private touchStartX = 0;

  get currentImage() {
    const imgs = this.lightbox.images();
    const idx = this.lightbox.currentIndex();
    return imgs[idx] ?? { url: '', alt: '' };
  }

  onPrev(e: Event) {
    e.stopPropagation();
    this.lightbox.prev();
  }

  onNext(e: Event) {
    e.stopPropagation();
    this.lightbox.next();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.lightbox.isOpen()) return;
    if (e.key === 'Escape') this.lightbox.close();
    if (e.key === 'ArrowLeft') this.lightbox.prev();
    if (e.key === 'ArrowRight') this.lightbox.next();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent) {
    if (!this.lightbox.isOpen()) return;
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      diff > 0 ? this.lightbox.next() : this.lightbox.prev();
    }
  }
}
