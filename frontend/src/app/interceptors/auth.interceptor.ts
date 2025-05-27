import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  
  // Don't add token for authentication endpoints
  if (shouldSkipAuthHeader(request.url)) {
    console.log('Skipping auth header for:', request.url);
    return next(request);
  }
  
  // Add auth token if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    console.log('Adding auth header for:', request.url);
    request = addToken(request, token);
  } else {
    console.warn('No token available for:', request.url);
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.log('Received 401 error, attempting token refresh');
        // Try to refresh token
        return authService.refreshToken().pipe(
          switchMap(token => {
            // Retry the request with new token
            console.log('Token refreshed, retrying request');
            const authReq = addToken(request, token.access);
            return next(authReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, log the user out
            console.error('Token refresh failed, logging out', refreshError);
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      console.error('HTTP request error:', error);
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function shouldSkipAuthHeader(url: string): boolean {
  return (
    url.includes('/api/auth/login/') ||
    url.includes('/api/auth/register/') ||
    url.includes('/api/auth/token/refresh/')
  );
} 