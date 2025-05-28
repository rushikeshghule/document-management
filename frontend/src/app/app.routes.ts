import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'documents',
    loadComponent: () => import('./components/documents/document-list/document-list.component').then(m => m.DocumentListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'documents/upload',
    loadComponent: () => import('./components/documents/document-upload/document-upload.component').then(m => m.DocumentUploadComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'editor'] }
  },
  {
    path: 'documents/:id',
    loadComponent: () => import('./components/documents/document-detail/document-detail.component').then(m => m.DocumentDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'documents/:id/view',
    loadComponent: () => import('./components/documents/document-view/document-view.component').then(m => m.DocumentViewComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./components/users/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'recents',
    loadComponent: () => import('./pages/recents/recents.component').then(m => m.RecentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/shared/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./components/shared/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
