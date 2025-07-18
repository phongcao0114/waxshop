import {Routes} from '@angular/router';
import {HealthComponent} from './components/health/health.component';
import {UnauthorizedComponent} from './components/unauthorized/unauthorized.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {HomeComponent} from './components/home';
import { CartComponent } from './components/cart/cart.component';
import { OrderDetailsComponent } from './components/order/order-details.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'cart', component: CartComponent, canActivate: [AuthGuard]},
  {path: 'health', component: HealthComponent},
  {path: 'unauthorized', component: UnauthorizedComponent},
  {path: 'orders/latest', component: OrderDetailsComponent, canActivate: [AuthGuard]},
  {path: 'profile', loadComponent: () => import('./user/user-profile/user-profile.component').then(m => m.UserProfileComponent), canActivate: [AuthGuard]},
  {path: 'product/:id', loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent)},
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' },
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {path: '**', component: NotFoundComponent}
];
