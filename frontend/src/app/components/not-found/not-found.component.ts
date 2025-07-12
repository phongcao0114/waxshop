import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatIconModule, CommonModule, AsyncPipe],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
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
