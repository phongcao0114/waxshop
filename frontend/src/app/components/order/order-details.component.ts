import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from './order.service';
import { Order } from './order.model';
import { environment } from '../../environment';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule],
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

  // Status filter (no SHIPPED)
  statusOptions: string[] = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
  selectedStatus: string = 'ALL';
  statusCounts: { [key: string]: number } = {};

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.fetchOrders();
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
        this.fetchOrders();
      },
      error: () => {
        this.error = 'Failed to cancel order.';
        this.cancelingOrderId = null;
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
        this.fetchOrders();
      },
      error: () => {
        this.error = 'Failed to mark order as delivered.';
        this.markingDeliveredOrderId = null;
      }
    });
  }
} 