import { Component, OnInit } from '@angular/core';
import { CartService } from './cart.service';
import { CartItem } from './cart-item.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environment';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = true;
  subtotal = 0;
  environment = environment;
  shippingFee = 0;
  toastMessage: string = '';
  user$: Observable<any>;
  cartCount$: Observable<number>;

  addressForm: FormGroup;
  paymentMethod = 'Cash on delivery';
  phonePattern = /^0[0-9]{9,10}$/;

  constructor(
    private cartService: CartService,
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.user$ = this.auth.user$;
    this.cartCount$ = this.cartService.cartCount$;
    
    this.addressForm = this.fb.group({
      shippingAddress: ['', Validators.required],
      shippingCity: ['', Validators.required],
      shippingPostalCode: ['', Validators.required],
      shippingCountry: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(this.phonePattern)]]
    });
  }

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.subtotal = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
      this.loading = false;
    });
    this.cartService.fetchCartItems();
  }

  changeQty(item: CartItem, newQty: number) {
    if (newQty < 1) return;
    this.cartService.updateCartItem(item.productId, newQty).subscribe({
      next: () => this.cartService.fetchCartItems()
    });
  }

  onQtyBlur(item: CartItem) {
    if (item.quantity < 1) item.quantity = 1;
    this.changeQty(item, item.quantity);
  }

  removeItem(item: CartItem) {
    this.cartService.removeCartItem(item.productId).subscribe({
      next: () => this.cartService.fetchCartItems()
    });
  }

  get totalAmount(): number {
    return this.subtotal + this.shippingFee;
  }

  logout() {
    this.auth.logout();
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = '', 2500);
  }

  checkout() {
    if (this.addressForm.invalid) return;
    const productIds = this.cartItems.map(item => item.productId);
    const shippingFee = this.shippingFee;
    const totalAmount = this.totalAmount;
    const body = {
      ...this.addressForm.value,
      productIds,
      paymentMethod: this.paymentMethod,
      shippingFee,
      totalAmount
    };
    fetch(this.environment.backendUrl + '/api/orders/place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(body)
    })
      .then(res => {
        if (!res.ok) throw new Error('Order failed');
        return res.json();
      })
      .then(() => {
        this.cartService.cartItems$.next([]);
        this.cartService.cartCount$.next(0);
        this.showToast('Order placed successfully!');
        this.router.navigate(['/orders/latest']);
      })
      .catch(() => {
        this.showToast('Failed to place order. Please try again.');
      });
  }

  getImageUrl(item: CartItem): string {
    return this.environment.backendUrl + item.productImage;
  }
}
