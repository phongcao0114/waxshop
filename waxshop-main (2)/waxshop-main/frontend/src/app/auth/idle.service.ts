import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { timer, fromEvent, merge, switchMap, of, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface IdleWarning {
  timeRemaining: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private readonly IDLE_TIMEOUT = 12 * 60 * 1000; // 12 minutes (3 minutes before token expires)
  private readonly WARNING_TIMEOUT = 10 * 60 * 1000; // 10 minutes (show warning 2 minutes before logout)
  private readonly CHECK_INTERVAL = 30000; // Check every 30 seconds
  
  private lastActivity = Date.now();
  private activityTimer: any;
  private warningTimer: any;
  private logoutTimer: any;
  
  // Observable subjects for components to subscribe to
  private warningSubject = new BehaviorSubject<IdleWarning | null>(null);
  private isIdleSubject = new BehaviorSubject<boolean>(false);
  
  public warning$ = this.warningSubject.asObservable();
  public isIdle$ = this.isIdleSubject.asObservable();

  constructor(private authService: AuthService) {
    this.startActivityMonitoring();
  }

  private startActivityMonitoring(): void {
    // Monitor user activity events
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'blur'
    ];

    const activity$ = merge(
      ...activityEvents.map(event => fromEvent(document, event))
    ).pipe(
      debounceTime(1000), // Debounce to avoid too many events
      distinctUntilChanged()
    );

    activity$.subscribe(() => {
      this.updateLastActivity();
    });

    // Check for idle state every 30 seconds
    timer(0, this.CHECK_INTERVAL).pipe(
      switchMap(() => {
        const timeSinceLastActivity = Date.now() - this.lastActivity;
        
        if (timeSinceLastActivity > this.IDLE_TIMEOUT) {
          // User is idle for too long, logout
          console.log('IdleService: User idle for too long, logging out');
          this.handleIdleLogout();
        } else if (timeSinceLastActivity > this.WARNING_TIMEOUT) {
          // Show warning
          const timeRemaining = this.IDLE_TIMEOUT - timeSinceLastActivity;
          this.showIdleWarning(timeRemaining);
        } else {
          // Clear any existing warnings
          this.clearWarning();
        }
        
        return of(null);
      })
    ).subscribe();
  }

  private updateLastActivity(): void {
    const wasIdle = this.isIdleSubject.value;
    this.lastActivity = Date.now();
    
    // Clear any existing timers
    this.clearTimers();
    
    // Update idle state
    if (wasIdle) {
      console.log('IdleService: User activity detected, clearing idle state');
      this.isIdleSubject.next(false);
      this.clearWarning();
    }
  }

  private showIdleWarning(timeRemaining: number): void {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    
    const warning: IdleWarning = {
      timeRemaining,
      message: `You will be logged out in ${minutes}:${seconds.toString().padStart(2, '0')} due to inactivity.`
    };
    
    this.warningSubject.next(warning);
    this.isIdleSubject.next(true);
    
    console.log('IdleService: Showing idle warning', warning);
  }

  private clearWarning(): void {
    this.warningSubject.next(null);
  }

  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private handleIdleLogout(): void {
    console.log('IdleService: Executing idle logout');
    this.clearTimers();
    this.clearWarning();
    this.isIdleSubject.next(false);
    
    // Show final warning before logout
    const warning: IdleWarning = {
      timeRemaining: 0,
      message: 'You have been logged out due to inactivity.'
    };
    this.warningSubject.next(warning);
    
    // Logout after a brief delay to show the message
    setTimeout(() => {
      this.authService.logout();
    }, 2000);
  }

  public getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity;
  }

  public isIdle(): boolean {
    return this.getTimeSinceLastActivity() > this.IDLE_TIMEOUT;
  }

  public resetActivity(): void {
    this.updateLastActivity();
  }

  // Public method to extend session (called when user interacts with warning)
  public extendSession(): void {
    console.log('IdleService: User extended session');
    this.updateLastActivity();
  }

  // Public method to force logout (for testing)
  public forceLogout(): void {
    console.log('IdleService: Force logout requested');
    this.handleIdleLogout();
  }

  // Get remaining time before logout
  public getTimeUntilLogout(): number {
    const timeSinceLastActivity = this.getTimeSinceLastActivity();
    return Math.max(0, this.IDLE_TIMEOUT - timeSinceLastActivity);
  }

  // Check if warning should be shown
  public shouldShowWarning(): boolean {
    const timeSinceLastActivity = this.getTimeSinceLastActivity();
    return timeSinceLastActivity > this.WARNING_TIMEOUT && timeSinceLastActivity < this.IDLE_TIMEOUT;
  }
} 