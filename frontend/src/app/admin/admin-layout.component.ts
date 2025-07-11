import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminStatsCardsComponent } from '../shared/admin-stats-cards.component';

@Component({
  selector: 'app-admin-layout',
  template: `
    <div class="admin-layout">
      <!-- Persistent Stats Cards (never destroyed) -->
      <app-admin-stats-cards></app-admin-stats-cards>
      
      <!-- Dynamic Content Area -->
      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./admin-layout.component.scss'],
  imports: [AdminStatsCardsComponent, RouterOutlet],
  standalone: true
})
export class AdminLayoutComponent {
  // This component persists across navigation
} 