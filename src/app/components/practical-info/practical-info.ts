import { Component } from '@angular/core';
import { TRIP_DATA } from '../../data/trip-data';
import { CurrencyConverterComponent } from '../currency-converter/currency-converter';
import { ChecklistComponent } from '../checklist/checklist';
import { WeatherBadgeComponent } from '../weather-badge/weather-badge';
import { TippingGuideComponent } from '../tipping-guide/tipping-guide';

@Component({
  selector: 'app-practical-info',
  standalone: true,
  imports: [CurrencyConverterComponent, ChecklistComponent, WeatherBadgeComponent, TippingGuideComponent],
  template: `
    <section id="praktisk" class="practical">
      <div class="container">
        <div class="practical__header">
          <span class="practical__eyebrow">Praktisk information</span>
          <h2 class="practical__title">Inden afrejse</h2>
        </div>

        <app-weather-badge />

        <div class="practical__grid">
          <div class="practical__card">
            <div class="practical__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1l5.5 3.2-2.9 2.9L4.3 13c-.4-.1-.9.1-1 .5l-.1.4c-.1.4 0 .8.3 1l3.1 2.1L8.7 20c.2.3.6.4 1 .3l.4-.1c.4-.2.6-.6.5-1.1z"/>
              </svg>
            </div>
            <h3 class="practical__card-title">Fly</h3>
            @for (flight of info.flights; track flight.code) {
              <a [href]="flight.url" target="_blank" rel="noopener" class="practical__detail practical__detail--link">
                <span class="practical__detail-label">{{ flight.code }}</span>
                <span class="practical__detail-value">{{ flight.route }}</span>
                <span class="practical__detail-note">{{ flight.time }}</span>
                <svg class="practical__detail-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 17l9.2-9.2M17 17V7.8H7.8"/>
                </svg>
              </a>
            }
          </div>

          <div class="practical__card">
            <div class="practical__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
              </svg>
            </div>
            <h3 class="practical__card-title">Hotel</h3>
            <a [href]="info.hotel.url" target="_blank" rel="noopener" class="practical__detail practical__detail--link">
              <span class="practical__detail-value practical__detail-value--bold">{{ info.hotel.name }}</span>
              <span class="practical__detail-note">{{ info.hotel.note }}</span>
              <svg class="practical__detail-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17l9.2-9.2M17 17V7.8H7.8"/>
              </svg>
            </a>
          </div>

          <div class="practical__card">
            <div class="practical__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
            </div>
            <h3 class="practical__card-title">Transport</h3>
            <ul class="practical__notes">
              @for (note of info.transportNotes; track note) {
                <li>{{ note }}</li>
              }
            </ul>
          </div>

          <div class="practical__card">
            <div class="practical__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 class="practical__card-title">Husk</h3>
            <ul class="practical__notes">
              @for (note of info.generalNotes; track note) {
                <li>{{ note }}</li>
              }
            </ul>
          </div>

          <div class="practical__card practical__card--emergency">
            <div class="practical__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <h3 class="practical__card-title">Nødkontakter</h3>
            @for (contact of info.emergencyContacts; track contact.label) {
              <a [href]="'tel:' + contact.number" class="practical__detail practical__detail--link practical__detail--phone">
                <span class="practical__detail-value">{{ contact.label }}</span>
                <span class="practical__detail-label">{{ contact.number }}</span>
                @if (contact.note) {
                  <span class="practical__detail-note">{{ contact.note }}</span>
                }
                <svg class="practical__detail-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </a>
            }
          </div>

          <app-currency-converter />
        </div>

        <div class="practical__extras">
          <app-tipping-guide />
        </div>

        <div class="practical__checklist-wrap">
          <app-checklist />
        </div>
      </div>
    </section>
  `,
  styleUrl: './practical-info.scss',
})
export class PracticalInfoComponent {
  info = TRIP_DATA.practicalInfo;
}
