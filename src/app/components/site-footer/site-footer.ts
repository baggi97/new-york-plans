import { Component } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer__divider"></div>
        <div class="footer__content">
          <div class="footer__brand">
            <span class="footer__logo">NYC 2026</span>
            <p class="footer__tagline">En personlig rejseguide til New York</p>
          </div>
          <div class="footer__details">
            <p>22.–27. april 2026</p>
            <p>2 rejsende · 6 dage · 1 by</p>
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
export class SiteFooterComponent {}
