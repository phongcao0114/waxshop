import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, tap, map, catchError, timer, switchMap, of, throwError} from 'rxjs';
import { environment } from '../environment';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: 'USER' | 'ADMIN';
    name: string;
  };
}

export interface AuthError {
  message: string;
  code: string;
  details?: any;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  private apiUrl = `${environment.backendUrl}/api/auth`;
  private userSubject = new BehaviorSubject<LoginResponse['user'] | null>(this.getUserFromStorage());
  private refreshSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<AuthError | null>(null);
  
  // Retry configuration
  private readonly MAX_REFRESH_RETRIES = 3;
  private readonly REFRESH_RETRY_DELAY = 2000; // 2 seconds
  private refreshRetryCount = 0;
  private lastRefreshAttempt = 0;
  private readonly REFRESH_COOLDOWN = 5000; // 5 seconds between refresh attempts
  
  user$ = this.userSubject.asObservable();
  refresh$ = this.refreshSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Start token refresh monitoring
    this.startTokenRefreshMonitoring();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {email, password}).pipe(
      tap(res => {
        this.handleSuccessfulAuth(res);
        this.clearError();
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  register(email: string, password: string, name: string, phone: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {email, password, name, phone}).pipe(
      tap(() => this.clearError()),
      catchError(this.handleAuthError.bind(this))
    );
  }

  logout() {
    console.log('AuthService: Logging out user');
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.refreshSubject.next(false);
    this.refreshRetryCount = 0;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserFromStorage() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('AuthService: Error parsing user from storage', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  getRole(): 'USER' | 'ADMIN' | null {
    const user = this.getUserFromStorage();
    return user?.role || null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    const isAuth = !!(token && user);
    
    if (isAuth && this.isTokenExpired()) {
      console.log('AuthService: Token is expired but user appears authenticated');
      // Don't logout immediately, let refresh logic handle it
    }
    
    return isAuth;
  }

  refreshToken(refreshToken: string): Observable<string> {
    const now = Date.now();
    
    // Check cooldown period
    if (now - this.lastRefreshAttempt < this.REFRESH_COOLDOWN) {
      return throwError(() => new Error('Refresh attempt too soon'));
    }
    
    // Check retry limit
    if (this.refreshRetryCount >= this.MAX_REFRESH_RETRIES) {
      console.error('AuthService: Max refresh retries exceeded');
      this.logout();
      return throwError(() => new Error('Max refresh retries exceeded'));
    }
    
    this.lastRefreshAttempt = now;
    this.refreshRetryCount++;
    this.refreshSubject.next(true);
    
    console.log(`AuthService: Attempting token refresh (attempt ${this.refreshRetryCount}/${this.MAX_REFRESH_RETRIES})`);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(res => {
        this.handleSuccessfulAuth(res);
        this.refreshRetryCount = 0; // Reset retry count on success
        this.refreshSubject.next(false);
        console.log('AuthService: Token refresh successful');
      }),
      map(res => res.token),
      catchError(error => {
        this.refreshSubject.next(false);
        console.error('AuthService: Token refresh failed', error);
        
        if (this.refreshRetryCount >= this.MAX_REFRESH_RETRIES) {
          console.error('AuthService: Max refresh retries reached, logging out');
          this.logout();
        }
        
        return throwError(() => error);
      })
    );
  }

  private handleSuccessfulAuth(res: LoginResponse) {
    // Validate response
    if (!res.token || !res.refreshToken || !res.user) {
      throw new Error('Invalid authentication response');
    }
    
    // Validate token format (basic JWT check)
    if (!this.isValidJWT(res.token)) {
      throw new Error('Invalid token format');
    }
    
    localStorage.setItem('token', res.token);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  private isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check if payload is valid JSON
      const payload = JSON.parse(atob(parts[1]));
      return payload && typeof payload === 'object';
    } catch {
      return false;
    }
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let authError: AuthError;
    
    if (error.status === 401) {
      authError = {
        message: 'Invalid credentials. Please check your email and password.',
        code: 'INVALID_CREDENTIALS'
      };
    } else if (error.status === 400) {
      authError = {
        message: error.error?.message || 'Invalid request data.',
        code: 'INVALID_REQUEST',
        details: error.error
      };
    } else if (error.status === 0 || error.status >= 500) {
      authError = {
        message: 'Server is temporarily unavailable. Please try again later.',
        code: 'SERVER_ERROR'
      };
    } else {
      authError = {
        message: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR'
      };
    }
    
    this.errorSubject.next(authError);
    return throwError(() => authError);
  }

  private clearError() {
    this.errorSubject.next(null);
  }

  decodeToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    try {
      if (!this.isValidJWT(token)) {
        return null;
      }
      
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('AuthService: Error decoding token', error);
      return null;
    }
  }

  private startTokenRefreshMonitoring(): void {
    // Check token every 30 seconds
    timer(0, 30000).pipe(
      switchMap(() => {
        const token = this.getToken();
        if (!token) {
          return of(null);
        }

        const decoded = this.decodeToken();
        if (!decoded || !decoded.exp) {
          console.log('AuthService: Invalid token, logging out');
          this.logout();
          return of(null);
        }

        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - now;
        
        // If token expires in less than 2 minutes, refresh it
        if (timeUntilExpiry < 120 && timeUntilExpiry > 0) {
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            console.log(`AuthService: Token expires in ${timeUntilExpiry}s, refreshing...`);
            return this.refreshToken(refreshToken).pipe(
              catchError(error => {
                console.error('AuthService: Auto-refresh failed', error);
                // Don't logout on auto-refresh failure, let user continue
                return of(null);
              })
            );
          }
        }
        
        return of(null);
      })
    ).subscribe();
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  getTimeUntilExpiry(): number {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now);
  }

  // Public method to manually refresh token (for testing/debugging)
  forceRefresh(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.refreshToken(refreshToken);
  }
}
