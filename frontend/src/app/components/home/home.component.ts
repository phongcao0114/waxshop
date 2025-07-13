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

  // Register form properties
  registerForm: any;
  registerLoading = false;
  registerError: string | null = null;
  registerSuccess: string | null = null;
  phonePattern = /^0[0-9]{9,10}$/;

  // UI state for toggle
  showRegister = false;

  // Track login state for hiding login/register section
  isLoggedIn = false;

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
    // Initialize register form
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    this.fetchProducts();
    // Keep isLoggedIn in sync with authentication state
    this.user$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
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
      // Scroll to login section instead of navigating to separate login page
      this.scrollToLogin();
      this.showToast('Please login to add items to cart');
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
        
        // Set isLoggedIn to true after successful login
        this.isLoggedIn = true;
        // Navigate based on role
        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        } else {
          // Stay on home page and scroll to top
          this.router.navigate(['/']).then(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
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

  // Register form methods
  submitRegister() {
    if (this.registerForm.invalid) return;
    this.registerLoading = true;
    this.registerError = null;
    this.registerSuccess = null;
    const { name, phone, email, password } = this.registerForm.value;
    this.auth.register(email!, password!, name!, phone!).subscribe({
      next: () => {
        this.registerLoading = false;
        this.registerSuccess = 'Registration successful! Please login.';
        setTimeout(() => {
          this.switchToLogin();
          this.registerForm.reset();
        }, 1500);
      },
      error: (err: any) => {
        this.registerLoading = false;
        console.log('Register error:', err);
        let apiMsg = '';
        if (typeof err.error?.details?.error === 'string') {
          apiMsg = err.error.details.error;
        } else if (typeof err.error?.error === 'string') {
          apiMsg = err.error.error;
        } else if (err.error?.message) {
          apiMsg = err.error.message;
        } else if (err.error?.error) {
          apiMsg = JSON.stringify(err.error.error);
        }
        this.registerError = apiMsg ? `Registration failed: ${apiMsg}` : 'Registration failed';
      }
    });
  }

  passwordsMatch(group: any) {
    return group.get('password')?.value === group.get('confirmPassword')?.value ? null : { notMatching: true };
  }

  switchToRegister() {
    this.showRegister = true;
    this.loginError = null;
    this.registerError = null;
    this.registerSuccess = null;
  }
  switchToLogin() {
    this.showRegister = false;
    this.registerError = null;
    this.registerSuccess = null;
  }

  onRegisterInput() {
    if (this.registerError) {
      this.registerError = null;
    }
  }
} 