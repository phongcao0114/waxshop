import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../admin/admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-stats-cards',
  template: `
    <div class="stats-grid">
      <div class="stat-card clickable" (click)="navigateToOrders('all')">
        <h3>Total Orders</h3>
        <p class="stat-number">{{ stats.totalOrders }}</p>
        <div class="stat-icon">📦</div>
      </div>
      <div class="stat-card clickable" (click)="navigateToOrders('PENDING')">
        <h3>Pending Orders</h3>
        <p class="stat-number">{{ stats.pendingOrders }}</p>
        <div class="stat-icon">⏳</div>
      </div>
      <div class="stat-card clickable" (click)="navigateToCategories()">
        <h3>Categories</h3>
        <p class="stat-number">{{ stats.totalCategories }}</p>
        <div class="stat-icon">📂</div>
      </div>
      <div class="stat-card clickable" (click)="navigateToProducts()">
        <h3>Products</h3>
        <p class="stat-number">{{ stats.totalProducts }}</p>
        <div class="stat-icon">🛍️</div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      padding: 1.5rem 2rem;
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }

    .stat-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }

    .stat-card h3 {
      margin: 0;
      font-size: 1rem;
      color: #666;
      text-align: center;
    }

    .stat-number {
      font-size: 2.2rem;
      font-weight: bold;
      margin: 0.5rem 0;
      color: #333;
    }

    .stat-icon {
      font-size: 2rem;
      margin-top: 0.5rem;
    }

    .clickable {
      cursor: pointer;
    }
  `],
  standalone: true
})
export class AdminStatsCardsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private refreshInterval: any;
  private lastUpdate = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  stats = {
    totalOrders: 0,
    pendingOrders: 0,
    totalCategories: 0,
    totalProducts: 0
  };

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadStats();
    
    // Auto-refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.loadStats();
    }, this.CACHE_DURATION);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadStats() {
    // Only load if not already loaded or if data is stale
    if (this.shouldRefreshStats()) {
      this.adminService.getAllOrders().pipe(
        takeUntil(this.destroy$)
      ).subscribe(orders => {
        this.stats.totalOrders = orders.length;
        this.stats.pendingOrders = orders.filter(order => order.status === 'PENDING' || order.status === 'PROCESSING').length;
        this.lastUpdate = Date.now();
      });

      this.adminService.getCategories().pipe(
        takeUntil(this.destroy$)
      ).subscribe(categories => {
        this.stats.totalCategories = categories.length;
        this.lastUpdate = Date.now();
      });

      this.adminService.getProducts().pipe(
        takeUntil(this.destroy$)
      ).subscribe(products => {
        this.stats.totalProducts = products.length;
        this.lastUpdate = Date.now();
      });
    }
  }

  private shouldRefreshStats(): boolean {
    // Check if stats are stale (older than 5 minutes)
    return !this.lastUpdate || (Date.now() - this.lastUpdate) > this.CACHE_DURATION;
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