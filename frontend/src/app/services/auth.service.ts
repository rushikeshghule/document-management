import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  last_login?: string | Date;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenHelper = new JwtHelperService();
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient, private router: Router) {
    // Safe initialization for SSR
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    // Initialize user from localStorage if available
    if (isPlatformBrowser(this.platformId)) {
      const user = this.getCurrentUser();
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  private getLocalStorageItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  private setLocalStorageItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        // Storage error, possibly in private browsing mode
      }
    }
  }

  private removeLocalStorageItem(key: string): void {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        // Storage error, possibly in private browsing mode
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{access: string, refresh: string, user: User}>(
      `${this.apiUrl}/login/`, 
      { email, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData)
      .pipe(
        catchError(error => {
          return throwError(() => new Error('Registration failed. Please try again.'));
        })
      );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Call the backend to invalidate the token
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout/`, { refresh: refreshToken })
        .subscribe({
          error: () => {} // Ignore errors during logout
        });
    }
    
    // Clear local storage and user subject regardless of API response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getLocalStorageItem('refreshToken');
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<{ access: string }>(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken })
      .pipe(
        tap(response => {
          this.setLocalStorageItem('accessToken', response.access);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => new Error('Session expired. Please login again.'));
        })
      );
  }

  isAuthenticated(): boolean {
    const token = this.getLocalStorageItem('accessToken');
    const isTokenValid = !!token && !this.tokenHelper.isTokenExpired(token);
    return isTokenValid;
  }

  /**
   * Check if the current user is an admin
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'admin';
  }

  /**
   * Check if the current user is an editor
   */
  isEditor(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && (user.role === 'editor' || user.role === 'admin');
  }

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    if (role === 'admin') {
      return user.role === 'admin';
    } else if (role === 'editor') {
      return user.role === 'editor' || user.role === 'admin';
    } else if (role === 'viewer') {
      return ['viewer', 'editor', 'admin'].includes(user.role);
    }
    
    return false;
  }

  getToken(): string | null {
    return this.getLocalStorageItem('accessToken');
  }

  getCurrentUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
} 