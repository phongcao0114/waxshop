import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from './order.service';
import { Order } from './order.model';
import { environment } from '../../environment';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  error: string | null = null;
  cancelingOrderId: number | null = null;
  markingDeliveredOrderId: number | null = null;
  environment = environment;
  toastMessage: string = '';
  user$: Observable<any>;
  cartCount$: Observable<number>;

  // Status filter (no SHIPPED)
  statusOptions: string[] = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
  selectedStatus: string = 'ALL';
  statusCounts: { [key: string]: number } = {};

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private cartService: CartService
  ) {
    this.user$ = this.auth.user$;
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit() {
    this.fetchOrders();
  }

  logout() {
    this.auth.logout();
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = '', 2500);
  }

  fetchOrders() {
    this.loading = true;
    this.error = null;
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            total: item.total !== undefined ? item.total : (item.price * item.quantity)
          }))
        })).sort((a, b) => {
          if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
          if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
          return b.id - a.id;
        });
        this.computeStatusCounts();
        this.applyStatusFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  computeStatusCounts() {
    const counts: { [key: string]: number } = {};
    for (const status of this.statusOptions) {
      if (status === 'ALL') {
        counts[status] = this.orders.length;
      } else {
        counts[status] = this.orders.filter(order => order.status === status).length;
      }
    }
    this.statusCounts = counts;
  }

  applyStatusFilter() {
    if (this.selectedStatus === 'ALL') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.selectedStatus);
    }
  }

  onStatusTabClick(status: string) {
    this.selectedStatus = status;
    this.applyStatusFilter();
  }

  getImageUrl(item: any): string {
    return this.environment.backendUrl + item.productImage;
  }

  confirmCancel(order: Order) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.cancelOrder(order);
    }
  }

  cancelOrder(order: Order) {
    this.cancelingOrderId = order.id;
    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.cancelingOrderId = null;
        this.showToast('Order cancelled successfully!');
        this.fetchOrders();
      },
      error: () => {
        this.error = 'Failed to cancel order.';
        this.cancelingOrderId = null;
        this.showToast('Failed to cancel order. Please try again.');
      }
    });
  }

  confirmMarkDelivered(order: Order) {
    if (confirm('Are you sure you have received this order?')) {
      this.markOrderDelivered(order);
    }
  }

  markOrderDelivered(order: Order) {
    this.markingDeliveredOrderId = order.id;
    this.orderService.markOrderDelivered(order.id).subscribe({
      next: () => {
        this.markingDeliveredOrderId = null;
        this.showToast('Order marked as delivered!');
        this.fetchOrders();
      },
      error: () => {
        this.error = 'Failed to mark order as delivered.';
        this.markingDeliveredOrderId = null;
        this.showToast('Failed to mark order as delivered. Please try again.');
      }
    });
  }
} 