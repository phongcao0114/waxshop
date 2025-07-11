import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, LoginResponse } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user$: Observable<LoginResponse['user'] | null>;
  cartCount$;

  constructor(private auth: AuthService, private cartService: CartService) {
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
