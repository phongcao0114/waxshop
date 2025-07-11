import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  categoryId: number;
  category?: Category;
}

export interface Order {
  id: number;
  userEmail: string;
  date: string;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  phoneNumber: string;
  shippingFee: number;
  totalAmount: number;
}

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.backendUrl}/api`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Get current user profile to verify authentication and role
  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/profile`, { headers: this.getAuthHeaders() });
  }

  // Category Management
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/admin/categories`, { headers: this.getAuthHeaders() });
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/admin/categories/${id}`, { headers: this.getAuthHeaders() });
  }

  createCategory(category: { name: string }): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/admin/categories`, category, { headers: this.getAuthHeaders() });
  }

  updateCategory(id: number, category: { name: string }): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/admin/categories/${id}`, category, { headers: this.getAuthHeaders() });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/categories/${id}`, { headers: this.getAuthHeaders() });
  }

  // Product Management
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`, { headers: this.getAuthHeaders() });
  }

  createProduct(productData: FormData): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.post<Product>(`${this.apiUrl}/admin/products`, productData, { headers });
  }

  updateProduct(id: number, productData: FormData): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.put<Product>(`${this.apiUrl}/admin/products/${id}`, productData, { headers });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/products/${id}`, { headers: this.getAuthHeaders() });
  }

  // Order Management
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/all`, { headers: this.getAuthHeaders() });
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/all/status/${status}`, { headers: this.getAuthHeaders() });
  }

  updateOrderStatus(orderId: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/orders/admin/${orderId}/status?status=${status}`, {}, { headers: this.getAuthHeaders() });
  }

  // User Management
  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/admin/users`, { headers: this.getAuthHeaders() });
  }

  getUserById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/admin/users/${id}`, { headers: this.getAuthHeaders() });
  }

  updateUser(id: number, userData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/admin/users/${id}`, userData, { headers: this.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/users/${id}`, { headers: this.getAuthHeaders() });
  }

  registerAdmin(userData: { email: string; password: string; name: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/admin/register`, userData, { headers: this.getAuthHeaders() });
  }
} 