import {Routes} from '@angular/router';
import {HealthComponent} from './components/health/health.component';
import {UnauthorizedComponent} from './components/unauthorized/unauthorized.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {LoginComponent} from './auth/login.component';
import {RegisterComponent} from './auth/register.component';
import {HomeComponent} from './components/home';
import { CartComponent } from './components/cart/cart.component';
import { OrderDetailsComponent } from './components/order/order-details.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'cart', component: CartComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'health', component: HealthComponent},
  {path: 'unauthorized', component: UnauthorizedComponent},
  {path: 'orders/latest', component: OrderDetailsComponent, canActivate: [AuthGuard]},
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' },
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {path: '**', component: NotFoundComponent}
];
