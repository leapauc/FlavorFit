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
      [class.hide]="slideOut"
      (animationend)="onAnimationEnd()"
    >
      <div class="notification-icon">
        <i class="bi bi-check-circle-fill" *ngIf="notification.type === 'success'"></i>
        <i class="bi bi-x-circle-fill" *ngIf="notification.type === 'error'"></i>
      </div>
      <div class="notification-content">
        <span class="notification-title">
          {{ notification.type === 'success' ? 'Succès' : 'Erreur' }}
        </span>
        <span class="notification-message">{{ notification.message }}</span>
      </div>
      <button type="button" class="notification-close" aria-label="Fermer" (click)="close()">
        &times;
      </button>
      <div class="notification-timer"></div>
    </div>
  `,
  styleUrls: ['./global-notification.component.css'],
})
export class GlobalNotificationComponent {
  notification: Notification | null = null;
  slideOut = false;
  private timeout?: ReturnType<typeof setTimeout>;

  constructor(private notificationService: NotificationService) {
    this.notificationService.notification$.subscribe((n) => {
      if (n) {
        this.notification = n;
        this.slideOut = false;
        this.clearTimer();
        this.timeout = setTimeout(() => {
          this.slideOut = true;
        }, 4500);
      }
    });
  }

  close() {
    this.slideOut = true;
  }

  onAnimationEnd() {
    if (this.slideOut) {
      this.notification = null;
      this.clearTimer();
    }
  }

  private clearTimer() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }
}
