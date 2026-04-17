import { Component, HostListener, signal, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { DarkModeService } from '../../services/dark-mode.service';
import { TripStatusService } from '../../services/trip-status.service';

@Component({
  selector: 'app-sticky-nav',
  standalone: true,
  imports: [NgClass],
  template: `
    <nav class="nav" [ngClass]="{ 'nav--visible': isVisible(), 'nav--scrolled': isScrolled() }">
      <div class="nav__progress" [style.width.%]="scrollProgress()"></div>
      <div class="nav__inner">
        <a href="#top" class="nav__logo">NYC</a>
        <div class="nav__links" #linksContainer>
          @for (link of links; track link.id) {
            <a [href]="'#' + link.id"
               class="nav__link"
               [class.nav__link--active]="activeSection() === link.id"
               [class.nav__link--today]="isTodayLink(link.id)">
              {{ link.label }}
              @if (isTodayLink(link.id)) {
                <span class="nav__today-dot"></span>
              }
            </a>
          }
        </div>
        <div class="nav__tools">
          <span class="nav__timezone" title="New York tid">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ tripStatus.nycTime() }}
          </span>
          <button class="nav__darkmode" (click)="darkMode.toggle()" [attr.aria-label]="darkMode.isDark() ? 'Lys tilstand' : 'Mørk tilstand'">
            @if (darkMode.isDark()) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            }
          </button>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './sticky-nav.scss',
})
export class StickyNavComponent implements AfterViewInit {
  @ViewChild('linksContainer') linksContainer!: ElementRef<HTMLElement>;

  darkMode = inject(DarkModeService);
  tripStatus = inject(TripStatusService);

  isVisible = signal(false);
  isScrolled = signal(false);
  activeSection = signal('overblik');
  scrollProgress = signal(0);

  links = [
    { id: 'overblik', label: 'Overblik' },
    { id: 'dag-1', label: 'Dag 1' },
    { id: 'dag-2', label: 'Dag 2' },
    { id: 'dag-3', label: 'Dag 3' },
    { id: 'dag-4', label: 'Dag 4' },
    { id: 'dag-5', label: 'Dag 5' },
    { id: 'dag-6', label: 'Dag 6' },
    { id: 'mad', label: 'Mad' },
    { id: 'kort', label: 'Kort' },
    { id: 'praktisk', label: 'Praktisk' },
  ];

  private sectionIds = this.links.map(l => l.id);

  ngAfterViewInit() {
    this.updateActiveSection();
  }

  isTodayLink(id: string): boolean {
    const dayNum = this.tripStatus.currentDayNumber();
    return dayNum > 0 && id === `dag-${dayNum}`;
  }

  @HostListener('window:scroll')
  onScroll() {
    const y = window.scrollY;
    this.isVisible.set(y > window.innerHeight * 0.5);
    this.isScrolled.set(y > window.innerHeight * 0.8);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress.set(docHeight > 0 ? (y / docHeight) * 100 : 0);

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
