import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-refresh-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isRefreshing) {
      <div class="refresh-indicator">
        <div class="refresh-spinner"></div>
        <span>Refreshing session...</span>
      </div>
    }
  `,
  styles: [`
    .refresh-indicator {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-size: 14px;
    }

    .refresh-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class RefreshIndicatorComponent implements OnInit, OnDestroy {
  isRefreshing = false;
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subscription.add(
      this.authService.refresh$.subscribe(
        isRefreshing => this.isRefreshing = isRefreshing
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
} 