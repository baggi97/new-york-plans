import { Component } from '@angular/core';
import { HeroSectionComponent } from './components/hero-section/hero-section';
import { StickyNavComponent } from './components/sticky-nav/sticky-nav';
import { TripSummaryComponent } from './components/trip-summary/trip-summary';
import { DaySectionComponent } from './components/day-section/day-section';
import { FoodListComponent } from './components/food-list/food-list';
import { PracticalInfoComponent } from './components/practical-info/practical-info';
import { SiteFooterComponent } from './components/site-footer/site-footer';
import { TRIP_DATA } from './data/trip-data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeroSectionComponent,
    StickyNavComponent,
    TripSummaryComponent,
    DaySectionComponent,
    FoodListComponent,
    PracticalInfoComponent,
    SiteFooterComponent,
  ],
  template: `
    <div id="top">
      <app-sticky-nav />
      <app-hero-section />
      <app-trip-summary />
      @for (day of days; track day.id) {
        <app-day-section [day]="day" />
      }
      <app-food-list />
      <app-practical-info />
      <app-site-footer />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AppComponent {
  days = TRIP_DATA.days;
}
