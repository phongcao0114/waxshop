import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environment';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  category: Category;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  searchQuery: string = '';
  loading = false;
  error = '';
  environment = environment;
  toastMessage: string = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading = true;
    this.error = '';
    this.http.get<Product[]>(`${environment.backendUrl}/api/products`)
      .subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load products.';
          this.loading = false;
        }
      });
  }

  searchProducts() {
    if (!this.searchQuery.trim()) {
      this.fetchProducts();
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${environment.backendUrl}/api/products/search?query=${encodeURIComponent(this.searchQuery)}&page=0&size=20`)
      .subscribe({
        next: (data) => {
          this.products = data.content || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to search products.';
          this.loading = false;
        }
      });
  }

  getImageUrl(product: Product): string {
    return this.environment.backendUrl + product.imageUrl;
  }

  addToCart(product: Product) {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.http.post(
      `${environment.backendUrl}/api/cart/add`,
      { productId: product.id, quantity: 1 },
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

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = '', 2500);
  }
} 