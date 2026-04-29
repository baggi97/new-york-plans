import { Component, signal, inject, HostListener } from '@angular/core';
import { DaySectionComponent } from '../day-section/day-section';
import { TripStatusService } from '../../services/trip-status.service';
import { TripService } from '../../services/trip.service';
import { hapticTap } from '../../utils/haptics';

@Component({
  selector: 'app-day-swiper',
  standalone: true,
  imports: [DaySectionComponent],
  template: `
    <div class="swiper">
      <div class="swiper__pills">
        @for (day of days; track day.id) {
          <button class="swiper__pill"
            [class.swiper__pill--active]="activeDay() === day.id"
            [class.swiper__pill--today]="day.id === todayDay()"
            (click)="goTo(day.id)">
            Dag {{ day.id }}
            @if (day.id === todayDay()) {
              <span class="swiper__today-dot"></span>
            }
          </button>
        }
      </div>
      <div class="swiper__viewport"
        (touchstart)="onTouchStart($event)"
        (touchend)="onTouchEnd($event)">
        <div class="swiper__slide" [class.swiper__slide--left]="slideDir() === 'left'" [class.swiper__slide--right]="slideDir() === 'right'">
          <app-day-section [day]="activeDayData()" />
        </div>
      </div>
    </div>
  `,
  styleUrl: './day-swiper.scss',
})
export class DaySwiperComponent {
  private tripStatus = inject(TripStatusService);
  private tripService = inject(TripService);
  get days() { return this.tripService.days(); }
  activeDay = signal(1);
  slideDir = signal<'left' | 'right' | null>(null);

  private touchStartX = 0;
  private touchStartY = 0;

  todayDay = this.tripStatus.currentDayNumber;

  activeDayData = signal(this.days[0]);

  constructor() {
    const today = this.tripStatus.currentDayNumber();
    if (today > 0 && today <= this.days.length) {
      this.activeDay.set(today);
      this.activeDayData.set(this.days[today - 1]);
    }
  }

  goTo(id: number) {
    if (id === this.activeDay()) return;
    hapticTap();
    const dir = id > this.activeDay() ? 'left' : 'right';
    this.slideDir.set(dir);
    setTimeout(() => {
      this.activeDay.set(id);
      this.activeDayData.set(this.days[id - 1]);
      this.slideDir.set(null);
    }, 10);
  }

  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) < 50 || Math.abs(dy) > 30) return;

    const current = this.activeDay();
    if (dx < 0 && current < this.days.length) {
      this.goTo(current + 1);
    } else if (dx > 0 && current > 1) {
      this.goTo(current - 1);
    }
  }
}
