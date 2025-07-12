import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../environment';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule, RouterLink, RouterLinkActive],
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
  user$: Observable<any>;
  cartCount$: Observable<number>;
  
  // Login form properties
  loginForm: any;
  loginLoading = false;
  loginError: string | null = null;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private cartService: CartService,
    private fb: FormBuilder
  ) {
    this.user$ = this.auth.user$;
    this.cartCount$ = this.cartService.cartCount$;
    
    // Initialize login form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

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

  logout() {
    this.auth.logout();
  }
  
  // Login form methods
  submitLogin() {
    if (this.loginForm.invalid) return;
    
    this.loginLoading = true;
    this.loginError = null;
    
    const {email, password} = this.loginForm.value;
    
    this.auth.login(email!, password!).pipe(
      catchError(error => {
        this.loginError = error.error?.message || 'Login failed. Please try again.';
        return of(null);
      }),
      finalize(() => {
        this.loginLoading = false;
      })
    ).subscribe(res => {
      if (res) {
        this.showToast('Login successful!');
        this.loginForm.reset();
        
        // Navigate based on role
        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          // Stay on home page
          this.router.navigate(['/']);
        }
      }
    });
  }

  onLoginInput() {
    if (this.loginError) {
      this.loginError = null;
    }
  }

  scrollToLogin() {
    const loginSection = document.getElementById('login');
    if (loginSection) {
      loginSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  scrollToGallery() {
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
} 