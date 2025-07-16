import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {
  user$: Observable<any>;
  cartCount$: Observable<number>;

  constructor(
    private auth: AuthService,
    private cartService: CartService
  ) {
    this.user$ = this.auth.user$;
    this.cartCount$ = this.cartService.cartCount$;
  }

  logout() {
    this.auth.logout();
  }
}
