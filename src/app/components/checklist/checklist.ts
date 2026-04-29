import { Component, signal, computed, inject } from '@angular/core';
import { TripService } from '../../services/trip.service';
import { ChecklistItem } from '../../data/trip.interfaces';
import { hapticTap } from '../../utils/haptics';

@Component({
  selector: 'app-checklist',
  standalone: true,
  template: `
    <div class="checklist">
      <div class="checklist__header">
        <h3 class="checklist__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Pakkeliste
        </h3>
        <span class="checklist__progress">{{ checkedCount() }} / {{ items.length }}</span>
      </div>
      <div class="checklist__progress-bar">
        <div class="checklist__progress-fill" [style.width.%]="progressPercent()"></div>
      </div>
      @for (category of categories; track category) {
        <div class="checklist__category">
          <span class="checklist__category-label">{{ category }}</span>
          @for (item of itemsByCategory(category); track item.id) {
            <label class="checklist__item" [class.checklist__item--checked]="isChecked(item.id)">
              <input type="checkbox" [checked]="isChecked(item.id)" (change)="toggle(item.id)" />
              <span class="checklist__checkbox">
                @if (isChecked(item.id)) {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                }
              </span>
              <span class="checklist__label">{{ item.label }}</span>
            </label>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './checklist.scss',
})
export class ChecklistComponent {
  private tripService = inject(TripService);
  get items() { return this.tripService.practicalInfo().checklist; }
  get categories() { return [...new Set(this.items.map(i => i.category))]; }
  private get lsKey() { return this.tripService.tripId() + '-checklist'; }

  private checked = signal<Set<string>>(this.loadChecked());

  checkedCount = computed(() => this.checked().size);
  progressPercent = computed(() => (this.checked().size / this.items.length) * 100);

  itemsByCategory(category: string): ChecklistItem[] {
    return this.items.filter(i => i.category === category);
  }

  isChecked(id: string): boolean {
    return this.checked().has(id);
  }

  toggle(id: string) {
    hapticTap();
    const next = new Set(this.checked());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.checked.set(next);
    this.saveChecked(next);
  }

  private loadChecked(): Set<string> {
    try {
      const stored = localStorage.getItem(this.lsKey);
      if (stored) return new Set(JSON.parse(stored));
    } catch { /* ignore */ }
    return new Set();
  }

  private saveChecked(checked: Set<string>) {
    localStorage.setItem(this.lsKey, JSON.stringify([...checked]));
  }
}
