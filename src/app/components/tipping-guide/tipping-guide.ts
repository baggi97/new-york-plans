import { Component } from '@angular/core';
import { TRIP_DATA } from '../../data/trip-data';

@Component({
  selector: 'app-tipping-guide',
  standalone: true,
  template: `
    <div class="tipping">
      <div class="tipping__header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        <h3 class="tipping__title">Tipping i NYC</h3>
      </div>
      <div class="tipping__list">
        @for (rule of rules; track rule.category) {
          <div class="tipping__rule">
            <span class="tipping__category">{{ rule.category }}</span>
            <span class="tipping__amount">{{ rule.tip }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './tipping-guide.scss',
})
export class TippingGuideComponent {
  rules = TRIP_DATA.practicalInfo.tipping;
}
