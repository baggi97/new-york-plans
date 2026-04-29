import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';
import { ItineraryCheckService } from '../../services/itinerary-check.service';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-next-up-widget',
  standalone: true,
  template: `
    @if (nextItem(); as item) {
      <button type="button" class="next-up" [class.next-up--hidden]="!isVisible()" (click)="scrollToProgram(item.dayId)">
        <div class="next-up__label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Næste punkt
        </div>
        <span class="next-up__item">{{ item.label }}</span>
        @if (item.duration) {
          <span class="next-up__duration">{{ item.duration }}</span>
        }
      </button>
    }
  `,
  styleUrl: './next-up-widget.scss',
})
export class NextUpWidgetComponent {
  private tripStatus = inject(TripStatusService);
  private tripService = inject(TripService);
  private itinerary = inject(ItineraryCheckService);
  isVisible = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.isVisible.set(window.scrollY > window.innerHeight * 0.5);
  }

  scrollToProgram(dayId: number) {
    const el = document.getElementById(`program-${dayId}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  nextItem = computed(() => {
    const dayNum = this.tripStatus.currentDayNumber();
    if (dayNum === 0) return null;
    const day = this.tripService.days().find(d => d.id === dayNum);
    if (!day) return null;
    const idx = this.itinerary.nextUncheckedIndex(dayNum);
    if (idx === -1) return null;
    const highlight = day.highlights[idx];
    return {
      dayId: dayNum,
      label: highlight.label,
      duration: highlight.duration,
    };
  });
}
