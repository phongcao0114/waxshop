import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environment';
import { Observable } from 'rxjs';
import { Order } from './order.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getUserOrders(): Observable<Order[]> {
    const token = this.auth.getToken();
    if (!token) throw new Error('Not authenticated');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Order[]>(`${environment.backendUrl}/api/orders/my-orders`, { headers });
  }

  cancelOrder(orderId: number): Observable<any> {
    const token = this.auth.getToken();
    if (!token) throw new Error('Not authenticated');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.patch(`${environment.backendUrl}/api/orders/${orderId}/cancel`, {}, { headers });
  }

  markOrderDelivered(orderId: number): Observable<any> {
    const token = this.auth.getToken();
    if (!token) throw new Error('Not authenticated');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.patch(`${environment.backendUrl}/api/orders/${orderId}/delivered`, {}, { headers });
  }
} 