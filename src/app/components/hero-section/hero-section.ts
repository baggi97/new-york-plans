import { Component, inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  template: `
    <section class="hero">
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
export class HeroSectionComponent implements AfterViewInit {
  tripStatus = inject(TripStatusService);
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
}
