import { Component } from '@angular/core';
import { TRIP_DATA } from '../../data/trip-data';

interface FoodDayGroup {
  dayId: number;
  dayTitle: string;
  date: string;
  food: { name: string; note?: string }[];
  fromList: { label: string; googleMapsUrl: string }[];
}

@Component({
  selector: 'app-food-list',
  standalone: true,
  template: `
    <section id="mad" class="food">
      <div class="container">
        <div class="food__header">
          <span class="food__eyebrow">Kulinarisk guide</span>
          <h2 class="food__title">Mad & drikke</h2>
          <p class="food__subtitle">Alle vores madanbefalinger samlet ét sted</p>
        </div>

        <div class="food__grid">
          @for (group of groups; track group.dayId) {
            <div class="food__card">
              <div class="food__card-header">
                <span class="food__card-day">Dag {{ group.dayId }}</span>
                <span class="food__card-date">{{ group.date }}</span>
              </div>
              <h3 class="food__card-title">{{ group.dayTitle }}</h3>

              @if (group.food.length > 0) {
                <div class="food__planned">
                  <span class="food__label">Planlagt</span>
                  @for (spot of group.food; track spot.name) {
                    <div class="food__spot">
                      <span class="food__spot-name">{{ spot.name }}</span>
                      @if (spot.note) {
                        <span class="food__spot-note">{{ spot.note }}</span>
                      }
                    </div>
                  }
                </div>
              }

              @if (group.fromList.length > 0) {
                <div class="food__alternatives">
                  <span class="food__label">Fra vores liste</span>
                  <div class="food__chips">
                    @for (item of group.fromList; track item.label) {
                      <a [href]="item.googleMapsUrl" target="_blank" rel="noopener" class="food__chip">
                        {{ item.label }}
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './food-list.scss',
})
export class FoodListComponent {
  groups: FoodDayGroup[] = TRIP_DATA.days.map(day => ({
    dayId: day.id,
    dayTitle: day.title,
    date: day.date,
    food: day.food,
    fromList: day.fromList,
  }));
}
