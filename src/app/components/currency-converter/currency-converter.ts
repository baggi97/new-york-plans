import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ConnectivityService } from '../../services/connectivity.service';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  template: `
    <div class="currency">
      <h3 class="currency__title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        Valutaomregner
      </h3>
      <div class="currency__row">
        <div class="currency__field">
          <label class="currency__label">{{ destCurrency }}</label>
          <input type="number" class="currency__input" [value]="foreign()" (input)="onForeignInput($event)" placeholder="0" inputmode="decimal" />
        </div>
        <span class="currency__arrow">→</span>
        <div class="currency__field">
          <label class="currency__label">{{ homeCurrency }}</label>
          <input type="number" class="currency__input" [value]="home()" (input)="onHomeInput($event)" placeholder="0" inputmode="decimal" />
        </div>
      </div>
      <span class="currency__rate">1 {{ destCurrency }} ≈ {{ rate().toFixed(2) }} {{ homeCurrency }}</span>

      @if (foreign() > 0) {
        <div class="currency__breakdown">
          <div class="currency__tip-section">
            <span class="currency__tip-label">Drikkepenge</span>
            <div class="currency__tip-options">
              @for (pct of tipOptions; track pct) {
                <button class="currency__tip-btn" [class.currency__tip-btn--active]="tipPct() === pct" (click)="tipPct.set(pct)">{{ pct }}%</button>
              }
            </div>
          </div>
          <div class="currency__detail-row">
            <span>+ tip</span>
            <span>{{ tipAmount().toFixed(2) }} {{ destCurrency }}</span>
          </div>
          <div class="currency__total-row">
            <span>Total</span>
            <span>{{ totalForeign().toFixed(2) }} {{ destCurrency }} ≈ {{ totalHome().toFixed(0) }} {{ homeCurrency }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './currency-converter.scss',
})
export class CurrencyConverterComponent implements OnInit {
  private connectivity = inject(ConnectivityService);
  private tripService = inject(TripService);

  get destCurrency() { return this.tripService.destination().currency; }
  get homeCurrency() { return this.tripService.trip().homeCurrency; }

  rate = signal(6.85);
  foreign = signal(25);
  home = signal(171);
  tipPct = signal(18);
  tipOptions = [15, 18, 20];

  tipAmount = computed(() => this.foreign() * (this.tipPct() / 100));
  totalForeign = computed(() => this.foreign() + this.tipAmount());
  totalHome = computed(() => this.totalForeign() * this.rate());

  ngOnInit() {
    this.fetchRate();
    this.home.set(Math.round(this.foreign() * this.rate() * 100) / 100);
    this.connectivity.onReconnect(() => this.fetchRate());
  }

  async fetchRate() {
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${this.destCurrency}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const homeRate = data.rates?.[this.homeCurrency];
      if (homeRate) {
        this.rate.set(homeRate);
        this.home.set(Math.round(this.foreign() * this.rate() * 100) / 100);
      }
    } catch { /* use fallback rate */ }
  }

  onHomeInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    this.home.set(val);
    this.foreign.set(Math.round((val / this.rate()) * 100) / 100);
  }

  onForeignInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    this.foreign.set(val);
    this.home.set(Math.round(val * this.rate() * 100) / 100);
  }
}
