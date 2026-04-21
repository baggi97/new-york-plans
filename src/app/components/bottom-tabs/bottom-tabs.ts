import { Component, output, signal } from '@angular/core';
import { hapticTap } from '../../utils/haptics';

export type TabId = 'hjem' | 'dage' | 'mad' | 'kort' | 'praktisk';

@Component({
  selector: 'app-bottom-tabs',
  standalone: true,
  template: `
    <nav class="tab-bar">
      @for (tab of tabs; track tab.id) {
        <button class="tab-bar__item"
          [class.tab-bar__item--active]="active() === tab.id"
          (click)="select(tab.id)">
          <svg class="tab-bar__icon" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            @switch (tab.id) {
              @case ('hjem') {
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              }
              @case ('dage') {
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              }
              @case ('mad') {
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
                <path d="M7 2v20"/>
                <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
              }
              @case ('kort') {
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              }
              @case ('praktisk') {
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              }
            }
          </svg>
          <span class="tab-bar__label">{{ tab.label }}</span>
        </button>
      }
    </nav>
  `,
  styleUrl: './bottom-tabs.scss',
})
export class BottomTabsComponent {
  tabChange = output<TabId>();
  active = signal<TabId>('hjem');

  tabs: { id: TabId; label: string }[] = [
    { id: 'hjem', label: 'Hjem' },
    { id: 'dage', label: 'Dage' },
    { id: 'mad', label: 'Mad' },
    { id: 'kort', label: 'Kort' },
    { id: 'praktisk', label: 'Info' },
  ];

  select(id: TabId) {
    hapticTap();
    this.active.set(id);
    this.tabChange.emit(id);
    window.scrollTo({ top: 0 });
  }
}
