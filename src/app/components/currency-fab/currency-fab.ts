import { Component, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CurrencyConverterComponent } from '../currency-converter/currency-converter';
import { hapticTap } from '../../utils/haptics';

@Component({
  selector: 'app-currency-fab',
  standalone: true,
  imports: [CurrencyConverterComponent],
  template: `
    @if (isVisible()) {
      <div class="currency-fab">
        @if (isOpen()) {
          <div class="currency-fab__popup">
            <app-currency-converter />
          </div>
        }
        <button class="currency-fab__btn" [class.currency-fab__btn--active]="isOpen()" (click)="toggle($event)" aria-label="Valutaomregner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </button>
      </div>
    }
  `,
  styleUrl: './currency-fab.scss',
})
export class CurrencyFabComponent {
  private el = inject(ElementRef);

  isOpen = signal(false);
  isVisible = signal(false);

  toggle(event: Event) {
    event.stopPropagation();
    hapticTap();
    this.isOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isOpen() && !this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isVisible.set(window.scrollY > window.innerHeight * 0.5);
  }
}
