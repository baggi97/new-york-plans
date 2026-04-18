import { Component, OnInit, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'app-update-toast',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="update-toast" [class.update-toast--fade-out]="fadingOut()">
        <span class="update-toast__icon">✦</span>
        <span class="update-toast__text">Siden er blevet opdateret</span>
      </div>
    }
  `,
  styleUrl: './update-toast.scss',
})
export class UpdateToastComponent implements OnInit, OnDestroy {
  visible = signal(false);
  fadingOut = signal(false);

  private handler = () => this.show();
  private timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit() {
    document.addEventListener('sw-updated', this.handler);
  }

  ngOnDestroy() {
    document.removeEventListener('sw-updated', this.handler);
    this.timers.forEach(clearTimeout);
  }

  private show() {
    this.visible.set(true);

    this.timers.push(
      setTimeout(() => this.fadingOut.set(true), 2500),
      setTimeout(() => location.reload(), 3200),
    );
  }
}
