import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorHandlerService, AppError } from '../auth/error-handler.service';
import { IdleService, IdleWarning } from '../auth/idle.service';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-error-notification',
  template: `
    <!-- Error/Warning/Info Notifications -->
    <div *ngIf="currentError" class="notification-container">
      <div class="notification" [ngClass]="'notification-' + currentError.type">
        <div class="notification-content">
          <div class="notification-icon">
            <span *ngIf="currentError.type === 'error'">❌</span>
            <span *ngIf="currentError.type === 'warning'">⚠️</span>
            <span *ngIf="currentError.type === 'info'">ℹ️</span>
          </div>
          <div class="notification-message">
            <div class="notification-text">{{ currentError.message }}</div>
            <div *ngIf="currentError.code && currentError.code !== 'UNKNOWN_ERROR'" class="notification-code">
              {{ currentError.code }}
            </div>
          </div>
          <button 
            *ngIf="errorHandler.isDismissible(currentError)"
            class="notification-close" 
            (click)="dismissError()"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Idle Warning -->
    <div *ngIf="idleWarning" class="notification-container idle-warning">
      <div class="notification notification-warning">
        <div class="notification-content">
          <div class="notification-icon">⏰</div>
          <div class="notification-message">
            <div class="notification-text">{{ idleWarning.message }}</div>
            <div class="notification-actions">
              <button class="btn btn-primary btn-sm" (click)="extendSession()">
                Stay Logged In
              </button>
              <button class="btn btn-secondary btn-sm" (click)="logoutNow()">
                Logout Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      margin-bottom: 10px;
    }

    .notification-error {
      border-left-color: #dc3545;
    }

    .notification-warning {
      border-left-color: #ffc107;
    }

    .notification-info {
      border-left-color: #17a2b8;
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
    }

    .notification-icon {
      font-size: 20px;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .notification-message {
      flex: 1;
      min-width: 0;
    }

    .notification-text {
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 4px;
      word-wrap: break-word;
    }

    .notification-code {
      font-size: 12px;
      color: #666;
      font-family: monospace;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 20px;
      color: #666;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      flex-shrink: 0;
      line-height: 1;
    }

    .notification-close:hover {
      color: #333;
    }

    .notification-actions {
      margin-top: 8px;
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 11px;
    }

    .idle-warning {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      right: auto;
      max-width: 500px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideInCenter {
      from {
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    .idle-warning .notification {
      animation: slideInCenter 0.3s ease-out;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class ErrorNotificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentError: AppError | null = null;
  idleWarning: IdleWarning | null = null;

  constructor(
    public errorHandler: ErrorHandlerService,
    private idleService: IdleService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to error notifications
    this.errorHandler.currentError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.currentError = error;
        
        // Auto-dismiss info messages after 5 seconds
        if (error?.type === 'info') {
          setTimeout(() => {
            this.dismissError();
          }, 5000);
        }
      });

    // Subscribe to idle warnings
    this.idleService.warning$
      .pipe(takeUntil(this.destroy$))
      .subscribe(warning => {
        this.idleWarning = warning;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismissError() {
    this.errorHandler.clearCurrentError();
  }

  extendSession() {
    this.idleService.extendSession();
    this.idleWarning = null;
  }

  logoutNow() {
    this.authService.logout();
  }
} 