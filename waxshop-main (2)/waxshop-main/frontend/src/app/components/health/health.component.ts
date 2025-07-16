import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonModule, JsonPipe} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { environment } from '../../environment';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, JsonPipe, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss']
})
export class HealthComponent {
  loading = true;
  error: string | null = null;
  data: any = null;
  environment = environment;
  user$: Observable<any>;
  cartCount$: Observable<number>;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cartService: CartService
  ) {
    this.user$ = this.auth.user$;
    this.cartCount$ = this.cartService.cartCount$;
    this.fetchHealth();
  }

  logout() {
    this.auth.logout();
  }

  fetchHealth() {
    this.loading = true;
    this.error = null;
    this.http.get(`${environment.backendUrl}/health`).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error fetching health status';
        this.loading = false;
      }
    });
  }
}
