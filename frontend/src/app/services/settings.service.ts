import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccountSettings {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  defaultView: 'list' | 'grid';
}

export interface UserSettings {
  account: AccountSettings;
  security: SecuritySettings;
  display: DisplaySettings;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) { }

  // Get all user settings
  getUserSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(`${this.apiUrl}/`);
  }

  // Update account settings
  updateAccountSettings(data: AccountSettings): Observable<AccountSettings> {
    return this.http.patch<AccountSettings>(`${this.apiUrl}/account/`, data);
  }

  // Update security settings
  updateSecuritySettings(data: Partial<SecuritySettings>, currentPassword?: string, newPassword?: string): Observable<SecuritySettings> {
    const payload: any = { ...data };
    
    if (currentPassword && newPassword) {
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }
    
    return this.http.patch<SecuritySettings>(`${this.apiUrl}/security/`, payload);
  }

  // Update display settings
  updateDisplaySettings(data: DisplaySettings): Observable<DisplaySettings> {
    return this.http.patch<DisplaySettings>(`${this.apiUrl}/display/`, data);
  }
} 