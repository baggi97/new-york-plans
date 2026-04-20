import { Component, inject, AfterViewInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  template: `
    <section class="hero">
      @for (img of images; track img; let i = $index) {
        <div class="hero__bg"
             [class.hero__bg--active]="i === activeIdx()"
             [style.backgroundImage]="'url(' + img + ')'">
        </div>
      }
      <div class="hero__overlay"></div>
      <div class="hero__content">
        <span class="hero__countdown">{{ tripStatus.heroLabel() }}</span>
        <span class="hero__eyebrow">April 2026 · 6 dage · 2 rejsende</span>
        <h1 class="hero__title">New York</h1>
        <p class="hero__subtitle">A curated guide for two</p>
      </div>
      <div class="hero__scroll-hint">
        <span>Scroll ned</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
      </div>
    </section>
  `,
  styleUrl: './hero-section.scss',
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  tripStatus = inject(TripStatusService);
  private cdr = inject(ChangeDetectorRef);
  private interval?: ReturnType<typeof setInterval>;

  activeIdx = signal(0);

  images = [
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&q=80',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=80',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80',
    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=1600&q=80',
    'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1600&q=80',
  ];

  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.interval = setInterval(() => {
      this.activeIdx.update(i => (i + 1) % this.images.length);
    }, 7000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }
}
