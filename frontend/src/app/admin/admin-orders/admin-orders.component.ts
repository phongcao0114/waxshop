import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService, Order } from '../admin.service';
import { ActivatedRoute } from '@angular/router';
import { AdminStatsRefreshService } from '../../shared/admin-stats-refresh.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe]
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  allOrders: Order[] = [];
  loading = true;
  error = '';
  toastMessage = '';
  selectedOrder: Order | null = null;
  showOrderDetails = false;
  currentFilter: string | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private statsRefresh: AdminStatsRefreshService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      this.currentFilter = status;
      this.loadOrders(status);
    });
  }

  loadOrders(status?: string) {
    this.loading = true;
    this.error = '';

    if (this.currentFilter === 'ACTIVE') {
      // If we already have allOrders loaded, reuse it
      if (this.allOrders.length > 0) {
        this.applyActiveFilter();
        this.loading = false;
      } else {
        this.adminService.getAllOrders().subscribe({
          next: (orders) => {
            this.allOrders = orders;
            this.applyActiveFilter();
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load orders';
            this.loading = false;
            console.error('Error loading orders:', err);
          }
        });
      }
    } else {
      const ordersObservable = status && status !== 'all' 
        ? this.adminService.getOrdersByStatus(status)
        : this.adminService.getAllOrders();
      ordersObservable.subscribe({
        next: (orders) => {
          this.allOrders = orders;
          this.orders = orders.sort((a, b) => {
            if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
            if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
            return a.id - b.id;
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load orders';
          this.loading = false;
          console.error('Error loading orders:', err);
        }
      });
    }
  }

  applyActiveFilter() {
    const filtered = this.allOrders.filter(order =>
      order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'SHIPPING'
    );
    this.orders = filtered.sort((a, b) => {
      if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
      if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
      return a.id - b.id;
    });
  }

  clearFilter() {
    this.currentFilter = null;
    this.loadOrders();
  }

  getStatusFlowDescription(currentStatus: string): string {
    const statusFlow = ['PENDING', 'PROCESSING', 'SHIPPING'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    if (currentStatus === 'CANCELLED') {
      return 'Order is cancelled. No further updates allowed.';
    }
    
    if (currentIndex === -1) {
      return 'Can update to: PROCESSING, SHIPPING, or CANCELLED';
    }
    
    const nextStatuses = statusFlow.slice(currentIndex + 1);
    const options = [...nextStatuses, 'CANCELLED'];
    return `Can update to: ${options.join(', ')}`;
  }

  updateOrderStatus(order: Order, newStatus: string) {
    // Validate the status update
    const validOptions = this.getStatusOptions(order.status);
    if (!validOptions.includes(newStatus)) {
      this.showToast(`Invalid status update: ${order.status} -> ${newStatus}`);
      return;
    }
    
    this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        order.status = newStatus;
        this.showToast(`Order #${order.id} status updated to ${newStatus}`);
        
        // Re-sort orders after status update
        this.orders = this.orders.sort((a, b) => {
          if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
          if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
          return a.id - b.id;
        });
        this.statsRefresh.triggerRefresh();
      },
      error: (err) => {
        this.showToast('Failed to update order status');
        console.error('Error updating order status:', err);
      }
    });
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  closeOrderDetails() {
    this.selectedOrder = null;
    this.showOrderDetails = false;
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'PROCESSING':
        return 'status-processing';
      case 'SHIPPING':
        return 'status-shipping';
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

  getStatusOptions(currentStatus: string): string[] {
    // Define the status flow
    const statusFlow = ['PENDING', 'PROCESSING', 'SHIPPING'];
    
    // If order is CANCELLED or DELIVERED, no status updates allowed
    if (currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') {
      return [];
    }
    
    // Find current status position in flow
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    // If current status is not in the defined flow, allow all valid statuses
    if (currentIndex === -1) {
      return ['PROCESSING', 'SHIPPING', 'CANCELLED'];
    }
    
    // Only allow forward progression and CANCELLED
    const validOptions = [];
    
    // Add forward statuses (next in flow)
    for (let i = currentIndex + 1; i < statusFlow.length; i++) {
      validOptions.push(statusFlow[i]);
    }
    
    // Always allow CANCELLED (terminal state)
    validOptions.push('CANCELLED');
    
    return validOptions;
  }

  canUpdateStatus(status: string): boolean {
    // Disable updates for CANCELLED or DELIVERED orders (terminal state)
    return status !== 'CANCELLED' && status !== 'DELIVERED';
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }

  calculateTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  onStatusChange(event: Event, order: Order) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value && this.canUpdateStatus(order.status)) {
      this.updateOrderStatus(order, target.value);
    }
  }

  onModalStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value && this.selectedOrder && this.canUpdateStatus(this.selectedOrder.status)) {
      this.updateOrderStatus(this.selectedOrder, target.value);
    }
  }

  // Add these methods for order summary calculations
  getSelectedOrderSubtotal(): number {
    if (!this.selectedOrder || !this.selectedOrder.items) return 0;
    return this.selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getSelectedOrderShipping(): string {
    if (!this.selectedOrder) return '€0.00';
    if (!this.selectedOrder.shippingFee || this.selectedOrder.shippingFee === 0) return 'Free';
    return `€${this.selectedOrder.shippingFee.toFixed(2)}`;
  }

  getSelectedOrderTotal(): number {
    if (!this.selectedOrder) return 0;
    return this.getSelectedOrderSubtotal() + (this.selectedOrder.shippingFee || 0);
  }
} 