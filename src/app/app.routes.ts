import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout').then(m => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'exchanger',
        loadComponent: () => import('./pages/exchanger/exchanger').then(m => m.Exchanger),
      },
      {
        path: 'subscription',
        loadComponent: () => import('./pages/subscription/subscription').then(m => m.Subscription),
      },
      {
        path: 'admin',
        loadComponent: () => import('./pages/admin/admin').then(m => m.Admin),
        canActivate: [adminGuard],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
