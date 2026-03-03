import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  Notification,
} from '../../services/notification.services';

@Component({
  selector: 'app-global-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="notification"
      class="notification-popup"
      [ngClass]="notification.type"
      [class.slide-out]="slideOut"
      (animationend)="onAnimationEnd()"
    >
      {{ notification.message }}
    </div>
  `,
  styleUrls: ['./global-notification.component.css'],
})
export class GlobalNotificationComponent {
  notification: Notification | null = null;
  slideOut = false;

  constructor(private notificationService: NotificationService) {
    this.notificationService.notification$.subscribe((n) => {
      if (n) {
        this.notification = n;
        this.slideOut = false;

        setTimeout(() => {
          this.slideOut = true;
        }, 4500); // commence le slide-out avant disparition
      }
    });
  }

  onAnimationEnd() {
    if (this.slideOut) this.notification = null;
  }
}
