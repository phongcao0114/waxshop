import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = this.authService.getToken();
    const role = this.authService.getRole();
    const user = this.authService.getUserFromStorage();
    
    // Check if user is authenticated
    if (!token) {
      return this.router.parseUrl('/login');
    }
    
    // Check if user data exists
    if (!user) {
      this.authService.clearAuthData();
      return this.router.parseUrl('/login');
    }
    
    // Check if user has admin role
    if (role === 'ADMIN') {
      return true;
    } else {
      return this.router.parseUrl('/unauthorized');
    }
  }
}

