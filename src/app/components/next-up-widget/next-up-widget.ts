import { Component, inject, computed } from '@angular/core';
import { TripStatusService } from '../../services/trip-status.service';
import { ItineraryCheckService } from '../../services/itinerary-check.service';
import { TRIP_DATA } from '../../data/trip-data';

@Component({
  selector: 'app-next-up-widget',
  standalone: true,
  template: `
    @if (nextItem(); as item) {
      <a [href]="'#dag-' + item.dayId" class="next-up">
        <div class="next-up__label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Næste punkt
        </div>
        <span class="next-up__item">{{ item.label }}</span>
        @if (item.duration) {
          <span class="next-up__duration">{{ item.duration }}</span>
        }
      </a>
    }
  `,
  styleUrl: './next-up-widget.scss',
})
export class NextUpWidgetComponent {
  private tripStatus = inject(TripStatusService);
  private itinerary = inject(ItineraryCheckService);

  nextItem = computed(() => {
    const dayNum = this.tripStatus.currentDayNumber();
    if (dayNum === 0) return null;
    const day = TRIP_DATA.days.find(d => d.id === dayNum);
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
