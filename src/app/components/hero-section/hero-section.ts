import { Component, inject, AfterViewInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';
import { TripService } from '../../services/trip.service';

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
        <span class="hero__eyebrow">{{ trip.dates }} · {{ trip.days.length }} dage · {{ trip.travelers }}</span>
        <h1 class="hero__title">{{ trip.title }}</h1>
        <p class="hero__subtitle">{{ trip.subtitle }}</p>
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
  private tripService = inject(TripService);
  private cdr = inject(ChangeDetectorRef);
  private interval?: ReturnType<typeof setInterval>;

  activeIdx = signal(0);

  get trip() { return this.tripService.trip(); }
  get images() { return this.trip.heroImages ?? []; }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.interval = setInterval(() => {
      if (this.images.length > 0) {
        this.activeIdx.update(i => (i + 1) % this.images.length);
      }
    }, 7000);
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }
}
