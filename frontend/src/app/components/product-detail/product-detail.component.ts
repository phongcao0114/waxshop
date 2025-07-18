import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../cart/cart.service';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  category?: {
    id: number;
    name: string;
  };
  dimensions?: string;
  weight?: string;
  size?: string;
  material?: string;
  productUse?: string;
  warranty?: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  error = '';
  quantity = 1;
  toastMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProduct();
  }

  loadProduct() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.error = 'Product ID not found';
      this.loading = false;
      return;
    }

    this.http.get<Product>(`${environment.backendUrl}/api/products/${productId}`)
      .subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load product details';
          this.loading = false;
        }
      });
  }

  getImageUrl(): string {
    if (!this.product?.imageUrl) return '';
    if (this.product.imageUrl.startsWith('http')) {
      return this.product.imageUrl;
    }
    return environment.backendUrl + this.product.imageUrl;
  }

  addToCart() {
    if (!this.product) return;

    const token = this.auth.getToken();
    if (!token) {
      this.showToast('Please login to add items to cart');
      return;
    }

    this.http.post(
      `${environment.backendUrl}/api/cart/add`,
      { productId: this.product.id, quantity: this.quantity },
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    ).subscribe({
      next: () => {
        this.cartService.fetchCartItems();
        this.showToast('Product added to cart!');
      },
      error: () => {
        this.showToast('Failed to add product to cart.');
      }
    });
  }

  updateQuantity(change: number) {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= (this.product?.stock || 1)) {
      this.quantity = newQuantity;
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = '', 3000);
  }
}