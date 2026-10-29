import { Routes } from '@angular/router';
import { ShellComponent } from './components/shell/shell';
import { adminAuthGuard, loginRedirectGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginRedirectGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage) },
      { path: 'stores', loadComponent: () => import('./pages/stores/stores').then((m) => m.StoresPage) },
      { path: 'stores/:id', loadComponent: () => import('./pages/stores/store-detail').then((m) => m.StoreDetailPage) },
      { path: 'users', loadComponent: () => import('./pages/users/users').then((m) => m.UsersPage) },
      { path: 'users/:id', loadComponent: () => import('./pages/users/user-detail').then((m) => m.UserDetailPage) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
