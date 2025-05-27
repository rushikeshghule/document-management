import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if roles are specified in route data
  const allowedRoles = route.data['roles'] as Array<string>;
  
  if (!allowedRoles || allowedRoles.length === 0) {
    console.error('No roles specified for roleGuard');
    return true; // No roles specified, allow access
  }
  
  // Check if user has any of the allowed roles
  const hasRole = allowedRoles.some(role => 
    role === 'admin' ? authService.isAdmin() : 
    role === 'editor' ? authService.isEditor() : 
    false
  );
  
  if (!hasRole) {
    router.navigate(['/unauthorized']);
    return false;
  }
  
  return true;
};