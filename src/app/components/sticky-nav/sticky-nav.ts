import { Component, HostListener, signal } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sticky-nav',
  standalone: true,
  imports: [NgClass],
  template: `
    <nav class="nav" [ngClass]="{ 'nav--visible': isVisible(), 'nav--scrolled': isScrolled() }">
      <div class="nav__inner">
        <a href="#top" class="nav__logo">NYC</a>
        <div class="nav__links">
          @for (link of links; track link.id) {
            <a [href]="'#' + link.id" class="nav__link">{{ link.label }}</a>
          }
        </div>
      </div>
    </nav>
  `,
  styleUrl: './sticky-nav.scss',
})
export class StickyNavComponent {
  isVisible = signal(false);
  isScrolled = signal(false);

  links = [
    { id: 'overblik', label: 'Overblik' },
    { id: 'dag-1', label: 'Dag 1' },
    { id: 'dag-2', label: 'Dag 2' },
    { id: 'dag-3', label: 'Dag 3' },
    { id: 'dag-4', label: 'Dag 4' },
    { id: 'dag-5', label: 'Dag 5' },
    { id: 'dag-6', label: 'Dag 6' },
    { id: 'mad', label: 'Mad' },
    { id: 'praktisk', label: 'Praktisk' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    const y = window.scrollY;
    this.isVisible.set(y > window.innerHeight * 0.5);
    this.isScrolled.set(y > window.innerHeight * 0.8);
  }
}
