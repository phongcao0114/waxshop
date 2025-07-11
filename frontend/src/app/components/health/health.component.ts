import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonModule, JsonPipe} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { environment } from '../../environment';

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

  constructor(private http: HttpClient) {
    this.fetchHealth();
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
