import { Component, inject } from '@angular/core';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer__divider"></div>
        <div class="footer__content">
          <div class="footer__brand">
            <span class="footer__logo">{{ trip.title }}</span>
            <p class="footer__tagline">En personlig rejseguide til {{ trip.destination.city }}</p>
          </div>
          <div class="footer__details">
            <p>{{ trip.dates }}</p>
            <p>{{ trip.travelers }} · {{ trip.days.length }} dage</p>
          </div>
        </div>
        <p class="footer__note">
          Lavet med kærlighed til den bedste rejse.
        </p>
      </div>
    </footer>
  `,
  styleUrl: './site-footer.scss',
})
export class SiteFooterComponent {
  private tripService = inject(TripService);
  get trip() { return this.tripService.trip(); }
}
