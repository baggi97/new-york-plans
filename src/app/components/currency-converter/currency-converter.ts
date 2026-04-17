import { Component, OnInit, signal } from '@angular/core';

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
          <label class="currency__label">DKK</label>
          <input type="number" class="currency__input" [value]="dkk()" (input)="onDkkInput($event)" placeholder="0" />
        </div>
        <span class="currency__arrow">→</span>
        <div class="currency__field">
          <label class="currency__label">USD</label>
          <input type="number" class="currency__input" [value]="usd()" (input)="onUsdInput($event)" placeholder="0" />
        </div>
      </div>
      <span class="currency__rate">1 USD ≈ {{ rate().toFixed(2) }} DKK</span>
    </div>
  `,
  styleUrl: './currency-converter.scss',
})
export class CurrencyConverterComponent implements OnInit {
  rate = signal(6.85);
  dkk = signal(100);
  usd = signal(15);

  ngOnInit() {
    this.fetchRate();
    this.usd.set(Math.round((this.dkk() / this.rate()) * 100) / 100);
  }

  async fetchRate() {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.rates?.DKK) {
        this.rate.set(data.rates.DKK);
        this.usd.set(Math.round((this.dkk() / this.rate()) * 100) / 100);
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
