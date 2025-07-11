import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { CartItem } from './cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartCount$ = new BehaviorSubject<number>(0);
  cartItems$ = new BehaviorSubject<CartItem[]>([]);

  constructor(private http: HttpClient) {}

  fetchCartItems() {
    this.http.get<CartItem[]>(environment.backendUrl + '/api/cart').subscribe({
      next: items => {
        this.cartItems$.next(items);
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount$.next(totalCount);
      },
      error: () => {
        this.cartItems$.next([]);
        this.cartCount$.next(0);
      }
    });
  }

  updateCartItem(productId: number, quantity: number) {
    return this.http.put(environment.backendUrl + '/api/cart/update', { productId, quantity });
  }

  removeCartItem(productId: number) {
    return this.http.delete(environment.backendUrl + `/api/cart/remove/${productId}`);
  }

  // Optionally, add checkout logic here if needed
  // checkout() {
  //   return this.http.post(environment.backendUrl + '/api/cart/checkout', {});
  // }
} 