import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log the full error for debugging
      console.error('API Error:', {
        url: req.url,
        status: error.status,
        statusText: error.statusText,
        error: error.error,
        message: error.message
      });
      
      if (error.status === 401) {
        // Auto logout if 401 response returned from API
        authService.logout();
        router.navigate(['/login']);
      }
      
      if (error.status === 403) {
        // Redirect to unauthorized page
        router.navigate(['/unauthorized']);
      }
      
      let errorMessage = 'An unknown error occurred';
      
      // Try to extract meaningful error message
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.detail) {
          errorMessage = error.error.detail;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.statusText) {
        errorMessage = error.statusText;
      }
      
      return throwError(() => ({ 
        message: errorMessage, 
        status: error.status,
        originalError: error 
      }));
    })
  );
}; 