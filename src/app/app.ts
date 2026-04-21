import { Component, OnInit, OnDestroy, HostListener, inject, signal } from '@angular/core';
import { HeroSectionComponent } from './components/hero-section/hero-section';
import { StickyNavComponent } from './components/sticky-nav/sticky-nav';
import { TripSummaryComponent } from './components/trip-summary/trip-summary';
import { DaySectionComponent } from './components/day-section/day-section';
import { DaySwiperComponent } from './components/day-swiper/day-swiper';
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
import { NotificationPromptComponent } from './components/notification-prompt/notification-prompt';
import { NearbyPanelComponent } from './components/nearby-panel/nearby-panel';
import { BottomTabsComponent, TabId } from './components/bottom-tabs/bottom-tabs';
import { DarkModeService } from './services/dark-mode.service';
import { PhotoJournalService } from './services/photo-journal.service';
import { NotificationService } from './services/notification.service';
import { ItineraryCheckService } from './services/itinerary-check.service';
import { GeofenceService } from './services/geofence.service';
import { TRIP_DATA } from './data/trip-data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeroSectionComponent,
    StickyNavComponent,
    TripSummaryComponent,
    DaySectionComponent,
    DaySwiperComponent,
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
    NotificationPromptComponent,
    NearbyPanelComponent,
    BottomTabsComponent,
  ],
  template: `
    <div id="top">
      <app-sticky-nav />

      @if (isMobile()) {
        <!-- Mobile: view-based layout -->
        @switch (activeTab()) {
          @case ('hjem') {
            <div class="view-enter">
              <app-hero-section />
              <app-trip-summary />
            </div>
          }
          @case ('dage') {
            <div class="view-enter">
              <app-day-swiper />
            </div>
          }
          @case ('mad') {
            <div class="view-enter">
              <app-food-list />
            </div>
          }
          @case ('kort') {
            <div class="view-enter">
              <app-trip-map />
            </div>
          }
          @case ('praktisk') {
            <div class="view-enter">
              <app-practical-info />
              <app-site-footer />
            </div>
          }
        }
        <app-bottom-tabs (tabChange)="onTabChange($event)" />
      } @else {
        <!-- Desktop: full scroll layout -->
        <app-hero-section />
        <app-trip-summary />
        @for (day of days; track day.id) {
          <app-day-section [day]="day" />
        }
        <app-food-list />
        <app-trip-map />
        <app-practical-info />
        <app-site-footer />
      }

      <app-lightbox />
      <app-offline-indicator />
      <app-back-to-top />
      <app-next-up-widget />
      <app-currency-fab />
      <app-update-toast />
      <app-notification-prompt />
      <app-nearby-panel />
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
  activeTab = signal<TabId>('hjem');
  isMobile = signal(typeof window !== 'undefined' && window.innerWidth < 768);

  private darkMode = inject(DarkModeService);
  private journal = inject(PhotoJournalService);
  private notifications = inject(NotificationService);
  private itineraryCheck = inject(ItineraryCheckService);
  private geofence = inject(GeofenceService);
  private visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      this.notifications.checkAndNotify();
    }
  };

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  onTabChange(tab: TabId) {
    this.activeTab.set(tab);
  }

  ngOnInit() {
    this.darkMode.init();
    this.journal.init();
    this.notifications.init();
    this.itineraryCheck.init();
    this.geofence.init();
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }
}
