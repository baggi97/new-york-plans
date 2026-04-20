import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ConnectivityService } from '../../services/connectivity.service';

const NYC_TAX_RATE = 0.08875;

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
          <label class="currency__label">USD</label>
          <input type="number" class="currency__input" [value]="usd()" (input)="onUsdInput($event)" placeholder="0" inputmode="decimal" />
        </div>
        <span class="currency__arrow">→</span>
        <div class="currency__field">
          <label class="currency__label">DKK</label>
          <input type="number" class="currency__input" [value]="dkk()" (input)="onDkkInput($event)" placeholder="0" inputmode="decimal" />
        </div>
      </div>
      <span class="currency__rate">1 USD ≈ {{ rate().toFixed(2) }} DKK</span>

      @if (usd() > 0) {
        <div class="currency__breakdown">
          <div class="currency__mode">
            <button class="currency__mode-btn" [class.currency__mode-btn--active]="mode() === 'restaurant'" (click)="mode.set('restaurant')">Restaurant</button>
            <button class="currency__mode-btn" [class.currency__mode-btn--active]="mode() === 'shop'" (click)="mode.set('shop')">Butik</button>
          </div>

          @if (mode() === 'restaurant') {
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
              <span>\${{ tipAmount().toFixed(2) }}</span>
            </div>
            <div class="currency__total-row">
              <span>Total</span>
              <span>\${{ totalUsd().toFixed(2) }} ≈ {{ totalDkk().toFixed(0) }} kr.</span>
            </div>
          }

          @if (mode() === 'shop') {
            <div class="currency__detail-row">
              <span>Sales tax 8.875%</span>
              <span>+ \${{ taxAmount().toFixed(2) }}</span>
            </div>
            <div class="currency__total-row">
              <span>Total</span>
              <span>\${{ totalUsd().toFixed(2) }} ≈ {{ totalDkk().toFixed(0) }} kr.</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './currency-converter.scss',
})
export class CurrencyConverterComponent implements OnInit {
  private connectivity = inject(ConnectivityService);

  rate = signal(6.85);
  usd = signal(25);
  dkk = signal(171);
  mode = signal<'restaurant' | 'shop'>('restaurant');
  tipPct = signal(18);
  tipOptions = [15, 18, 20];

  tipAmount = computed(() => this.usd() * (this.tipPct() / 100));
  taxAmount = computed(() => this.usd() * NYC_TAX_RATE);

  totalUsd = computed(() => {
    if (this.mode() === 'restaurant') return this.usd() + this.tipAmount();
    return this.usd() + this.taxAmount();
  });

  totalDkk = computed(() => this.totalUsd() * this.rate());

  ngOnInit() {
    this.fetchRate();
    this.dkk.set(Math.round(this.usd() * this.rate() * 100) / 100);
    this.connectivity.onReconnect(() => this.fetchRate());
  }

  async fetchRate() {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.rates?.DKK) {
        this.rate.set(data.rates.DKK);
        this.dkk.set(Math.round(this.usd() * this.rate() * 100) / 100);
      }
    } catch { /* use fallback rate */ }
  }

  onDkkInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    this.dkk.set(val);
    this.usd.set(Math.round((val / this.rate()) * 100) / 100);
  }

  onUsdInput(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    this.usd.set(val);
    this.dkk.set(Math.round(val * this.rate() * 100) / 100);
  }
}
