import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HealthComponent } from './components/health/health.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService, LoginResponse } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';
import { IdleService } from './auth/idle.service';
import { CartService } from './components/cart/cart.service';
import { RefreshIndicatorComponent } from './shared/refresh-indicator/refresh-indicator.component';
import { ErrorNotificationComponent } from './shared/error-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FooterComponent,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    CommonModule,
    RefreshIndicatorComponent,
    ErrorNotificationComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'frontend';
  user$: Observable<LoginResponse['user'] | null>;
  cartCount$;

  constructor(
    private idle: IdleService,
    private auth: AuthService,
    private http: HttpClient,
    public cartService: CartService
  ) {
    this.user$ = this.auth.user$;
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit() {
    this.user$.subscribe(user => {
      if (user) {
        this.cartService.fetchCartItems();
      } else {
        this.cartService.cartCount$.next(0);
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}
