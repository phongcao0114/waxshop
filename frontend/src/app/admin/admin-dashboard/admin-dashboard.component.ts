import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, Order, Category, Product, UserProfile } from '../admin.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalOrders: 0,
    pendingOrders: 0,
    totalCategories: 0,
    totalProducts: 0
  };

  loading = true;
  error = '';
  currentUser: UserProfile | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    this.adminService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user profile';
        this.loading = false;
        console.error('Error loading user profile:', err);
      }
    });
  }

  loadDashboardData() {
    this.loading = true;
    this.error = '';

    // Load orders for stats
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.stats.totalOrders = orders.length;
        this.stats.pendingOrders = orders.filter(order => 
          order.status === 'PENDING' || order.status === 'PROCESSING'
        ).length;
      },
      error: (err) => {
        this.error = 'Failed to load orders data';
      }
    });

    // Load categories for stats
    this.adminService.getCategories().subscribe({
      next: (categories) => {
        this.stats.totalCategories = categories.length;
      },
      error: (err) => {
        // Handle error silently
      }
    });

    // Load products for stats
    this.adminService.getProducts().subscribe({
      next: (products) => {
        this.stats.totalProducts = products.length;
      },
      error: (err) => {
        // Handle error silently
      }
    });

    this.loading = false;
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'PROCESSING':
        return 'status-processing';
      case 'SHIPPED':
        return 'status-shipped';
      case 'DELIVERED':
        return 'status-delivered';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  navigateToOrders(status: string) {
    if (status === 'all') {
      this.router.navigate(['/admin/orders']);
    } else {
      this.router.navigate(['/admin/orders'], { queryParams: { status: status } });
    }
  }

  navigateToCategories() {
    this.router.navigate(['/admin/categories']);
  }

  navigateToProducts() {
    this.router.navigate(['/admin/products']);
  }
} 