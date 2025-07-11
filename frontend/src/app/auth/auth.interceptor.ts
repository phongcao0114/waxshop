import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../environment';
import { from, switchMap, catchError, throwError, BehaviorSubject, filter, take, Observable, of } from 'rxjs';

// Global state for refresh token management
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);
let failedRequests: any[] = [];

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const isApiUrl = req.url.startsWith(environment.backendUrl);

  if (token && isApiUrl) {
    // Check if token is expired before making request
    if (auth.isTokenExpired()) {
      if (refreshToken) {
        // Token is expired, try to refresh before making the request
        if (isRefreshing) {
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(newToken => {
              const authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(authReq);
            })
          );
        } else {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return auth.refreshToken(refreshToken).pipe(
            switchMap(newToken => {
              isRefreshing = false;
              refreshTokenSubject.next(newToken);
              
              const authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(authReq);
            }),
            catchError(refreshErr => {
              isRefreshing = false;
              refreshTokenSubject.next(null);
              console.error('AuthInterceptor: Token refresh failed during request', refreshErr);
              auth.logout();
              return throwError(() => refreshErr);
            })
          );
        }
      } else {
        console.error('AuthInterceptor: Token expired and no refresh token available');
        auth.logout();
        return throwError(() => new Error('Token expired and no refresh token available'));
      }
    }

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq).pipe(
      catchError(err => {
        if (err.status === 401 && refreshToken) {
          // Try to refresh token on 401 only
          if (isRefreshing) {
            // If already refreshing, wait for the new token
            return refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap(newToken => {
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                return next(retryReq);
              })
            );
          } else {
            // Start refresh process
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return auth.refreshToken(refreshToken).pipe(
              switchMap(newToken => {
                isRefreshing = false;
                refreshTokenSubject.next(newToken);
                
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                return next(retryReq);
              }),
              catchError(refreshErr => {
                isRefreshing = false;
                refreshTokenSubject.next(null);
                console.error('AuthInterceptor: Token refresh failed on 401', refreshErr);
                auth.logout();
                return throwError(() => refreshErr);
              })
            );
          }
        } else if (err.status === 401) {
          // 401 without refresh token: logout immediately
          console.error('AuthInterceptor: 401 received without refresh token');
          auth.logout();
          return throwError(() => err);
        } else if (err.status === 403) {
          // 403 might be due to expired token, try to refresh
          if (refreshToken && !isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return auth.refreshToken(refreshToken).pipe(
              switchMap(newToken => {
                isRefreshing = false;
                refreshTokenSubject.next(newToken);
                
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` }
                });
                return next(retryReq);
              }),
              catchError(refreshErr => {
                isRefreshing = false;
                refreshTokenSubject.next(null);
                console.error('AuthInterceptor: Token refresh failed on 403', refreshErr);
                // Don't logout on 403 refresh failure, let component handle
                return throwError(() => err);
              })
            );
          }
        } else if (err.status === 0) {
          // Network error
          console.error('AuthInterceptor: Network error', err);
          return throwError(() => new Error('Network error. Please check your connection.'));
        } else if (err.status >= 500) {
          // Server error
          console.error('AuthInterceptor: Server error', err);
          return throwError(() => new Error('Server error. Please try again later.'));
        }
        
        // For other errors, don't logout - let the component handle it
        console.error('AuthInterceptor: HTTP error', err);
        return throwError(() => err);
      })
    );
  }
  return next(req);
}; 