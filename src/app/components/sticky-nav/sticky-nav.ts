import { Component, HostListener, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sticky-nav',
  standalone: true,
  imports: [NgClass],
  template: `
    <nav class="nav" [ngClass]="{ 'nav--visible': isVisible(), 'nav--scrolled': isScrolled() }">
      <div class="nav__inner">
        <a href="#top" class="nav__logo">NYC</a>
        <div class="nav__links" #linksContainer>
          @for (link of links; track link.id) {
            <a [href]="'#' + link.id"
               class="nav__link"
               [class.nav__link--active]="activeSection() === link.id">
              {{ link.label }}
            </a>
          }
        </div>
      </div>
    </nav>
  `,
  styleUrl: './sticky-nav.scss',
})
export class StickyNavComponent implements AfterViewInit {
  @ViewChild('linksContainer') linksContainer!: ElementRef<HTMLElement>;

  isVisible = signal(false);
  isScrolled = signal(false);
  activeSection = signal('overblik');

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

  private sectionIds = this.links.map(l => l.id);

  ngAfterViewInit() {
    this.updateActiveSection();
  }

  @HostListener('window:scroll')
  onScroll() {
    const y = window.scrollY;
    this.isVisible.set(y > window.innerHeight * 0.5);
    this.isScrolled.set(y > window.innerHeight * 0.8);
    this.updateActiveSection();
  }

  private updateActiveSection() {
    const offset = window.innerHeight * 0.35;
    let current = this.sectionIds[0];

    for (const id of this.sectionIds) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = id;
      }
    }

    this.activeSection.set(current);
    this.scrollActiveIntoView(current);
  }

  private scrollActiveIntoView(id: string) {
    const container = this.linksContainer?.nativeElement;
    if (!container) return;
    const activeLink = container.querySelector(`[href="#${id}"]`) as HTMLElement;
    if (!activeLink) return;

    const containerRect = container.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    if (linkRect.left < containerRect.left || linkRect.right > containerRect.right) {
      activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
}
