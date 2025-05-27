import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './auth.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface UserCreate {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    console.log('Fetching users from', this.apiUrl);
    return this.http.get<User[]>(this.apiUrl)
      .pipe(
        tap(users => console.log('Fetched users:', users)),
        catchError(error => {
          console.error('Error fetching users:', error);
          return throwError(() => error);
        })
      );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: UserCreate): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  updateUserStatus(id: number, isActive: boolean): Observable<any> {
    console.log(`Calling updateUserStatus API: ${this.apiUrl}/${id}/status with is_active=${isActive}`);
    return this.http.patch(`${this.apiUrl}/${id}/status/`, { is_active: isActive })
      .pipe(
        tap(response => console.log('Status update response:', response)),
        catchError(error => {
          console.error('Error updating user status:', error);
          return throwError(() => error);
        })
      );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 