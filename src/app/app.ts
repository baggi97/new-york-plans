import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HeroSectionComponent } from './components/hero-section/hero-section';
import { StickyNavComponent } from './components/sticky-nav/sticky-nav';
import { TripSummaryComponent } from './components/trip-summary/trip-summary';
import { DaySectionComponent } from './components/day-section/day-section';
import { FoodListComponent } from './components/food-list/food-list';
import { TripMapComponent } from './components/trip-map/trip-map';
import { PracticalInfoComponent } from './components/practical-info/practical-info';
import { SiteFooterComponent } from './components/site-footer/site-footer';
import { LightboxComponent } from './components/lightbox/lightbox';
import { OfflineIndicatorComponent } from './components/offline-indicator/offline-indicator';
import { BackToTopComponent } from './components/back-to-top/back-to-top';
import { NextUpWidgetComponent } from './components/next-up-widget/next-up-widget';
import { CurrencyFabComponent } from './components/currency-fab/currency-fab';
import { UpdateToastComponent } from './components/update-toast/update-toast';
import { DarkModeService } from './services/dark-mode.service';
import { PhotoJournalService } from './services/photo-journal.service';
import { NotificationService } from './services/notification.service';
import { ItineraryCheckService } from './services/itinerary-check.service';
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
    TripMapComponent,
    PracticalInfoComponent,
    SiteFooterComponent,
    LightboxComponent,
    OfflineIndicatorComponent,
    BackToTopComponent,
    NextUpWidgetComponent,
    CurrencyFabComponent,
    UpdateToastComponent,
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
      <app-trip-map />
      <app-practical-info />
      <app-site-footer />
      <app-lightbox />
      <app-offline-indicator />
      <app-back-to-top />
      <app-next-up-widget />
      <app-currency-fab />
      <app-update-toast />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  days = TRIP_DATA.days;
  private darkMode = inject(DarkModeService);
  private journal = inject(PhotoJournalService);
  private notifications = inject(NotificationService);
  private itineraryCheck = inject(ItineraryCheckService);
  private visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      this.notifications.checkAndNotify();
    }
  };

  ngOnInit() {
    this.darkMode.init();
    this.journal.init();
    this.notifications.init();
    this.itineraryCheck.init();
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }
}
