import { Component, inject, signal } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-prompt',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="notif-prompt">
        <svg class="notif-prompt__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span class="notif-prompt__text">Aktivér notifikationer for påmindelser om dagens plan</span>
        <div class="notif-prompt__actions">
          <button class="notif-prompt__btn notif-prompt__btn--accept" (click)="accept()">Aktivér</button>
          <button class="notif-prompt__btn notif-prompt__btn--dismiss" (click)="dismiss()">Nej tak</button>
        </div>
      </div>
    }
  `,
  styleUrl: './notification-prompt.scss',
})
export class NotificationPromptComponent {
  private notifications = inject(NotificationService);
  visible = signal(this.notifications.needsPermission());

  async accept() {
    await this.notifications.requestAndSubscribe();
    this.visible.set(false);
  }

  dismiss() {
    this.notifications.dismissPrompt();
    this.visible.set(false);
  }
}
