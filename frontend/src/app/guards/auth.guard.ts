import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: User not authenticated, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Check if token is expired
    if (this.authService.isTokenExpired()) {
      console.log('AuthGuard: Token expired, attempting refresh');
      
      const refreshToken = this.authService.getRefreshToken();
      if (!refreshToken) {
        console.log('AuthGuard: No refresh token available, logging out');
        this.authService.logout();
        return false;
      }

      // Try to refresh token
      return this.authService.refreshToken(refreshToken).pipe(
        map(() => {
          console.log('AuthGuard: Token refreshed successfully');
          return this.checkRoleAccess(next);
        }),
        catchError(error => {
          console.error('AuthGuard: Token refresh failed', error);
          this.authService.logout();
          return of(false);
        })
      );
    }

    // Token is valid, check role access
    return this.checkRoleAccess(next);
  }

  private checkRoleAccess(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRole = route.data['role'] as string;
    const userRole = this.authService.getRole();

    // If no role is required, allow access
    if (!requiredRole) {
      return true;
    }

    // Check if user has required role
    if (userRole === requiredRole || userRole === 'ADMIN') {
      return true;
    }

    // User doesn't have required role
    console.log(`AuthGuard: User role ${userRole} doesn't have access to ${requiredRole} route`);
    
    if (userRole === 'USER') {
      // Regular user trying to access admin route
      this.router.navigate(['/unauthorized']);
    } else {
      // No role or other issue
      this.router.navigate(['/login']);
    }
    
    return false;
  }
}

