import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SettingsService, UserSettings } from '../../services/settings.service';
import { finalize } from 'rxjs/operators';

interface SettingSection {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  activeSection = 'account';
  
  accountForm!: FormGroup;
  securityForm!: FormGroup;
  displayForm!: FormGroup;
  
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  settingSections: SettingSection[] = [
    { id: 'account', name: 'Account', icon: 'bi bi-person' },
    { id: 'security', name: 'Security', icon: 'bi bi-shield-lock' },
    { id: 'display', name: 'Display', icon: 'bi bi-display' }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUserSettings();
  }
  
  initForms(): void {
    // Account form
    this.accountForm = this.fb.group({
      fullName: [''],
      email: [''],
      jobTitle: [''],
      department: ['']
    });
    
    // Security form
    this.securityForm = this.fb.group({
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: [''],
      twoFactorEnabled: [false]
    });
    
    // Display form
    this.displayForm = this.fb.group({
      theme: ['light'],
      fontSize: ['medium'],
      defaultView: ['list']
    });
  }
  
  loadUserSettings(): void {
    this.isLoading = true;
    this.error = null;
    
    this.settingsService.getUserSettings()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (settings: UserSettings) => {
          // Update forms with received settings
          this.accountForm.patchValue(settings.account);
          this.securityForm.patchValue({
            twoFactorEnabled: settings.security.twoFactorEnabled
          });
          this.displayForm.patchValue(settings.display);
        },
        error: (err) => {
          console.error('Error loading user settings', err);
          this.error = 'Unable to load settings. Please try again.';
        }
      });
  }
  
  setActiveSection(sectionId: string): void {
    this.activeSection = sectionId;
    this.clearMessages();
  }
  
  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
  
  saveAccountSettings(): void {
    if (this.accountForm.valid) {
      this.isSubmitting = true;
      this.clearMessages();
      
      this.settingsService.updateAccountSettings(this.accountForm.value)
        .pipe(
          finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Account settings saved successfully!';
          },
          error: (err) => {
            console.error('Error saving account settings', err);
            this.error = 'Failed to save account settings. Please try again.';
          }
        });
    }
  }
  
  saveSecuritySettings(): void {
    if (this.securityForm.valid) {
      const currentPassword = this.securityForm.get('currentPassword')?.value;
      const newPassword = this.securityForm.get('newPassword')?.value;
      const confirmPassword = this.securityForm.get('confirmPassword')?.value;
      
      // Validate passwords match if provided
      if (newPassword && newPassword !== confirmPassword) {
        this.error = 'New password and confirm password do not match.';
        return;
      }
      
      this.isSubmitting = true;
      this.clearMessages();
      
      const securityData = {
        twoFactorEnabled: this.securityForm.get('twoFactorEnabled')?.value
      };
      
      this.settingsService.updateSecuritySettings(
        securityData,
        currentPassword || undefined,
        newPassword || undefined
      )
        .pipe(
          finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Security settings updated successfully!';
            // Clear password fields
            this.securityForm.get('currentPassword')?.reset();
            this.securityForm.get('newPassword')?.reset();
            this.securityForm.get('confirmPassword')?.reset();
          },
          error: (err) => {
            console.error('Error updating security settings', err);
            this.error = 'Failed to update security settings. ' + 
                        (err.error?.message || 'Please check your current password and try again.');
          }
        });
    }
  }
  
  saveDisplaySettings(): void {
    if (this.displayForm.valid) {
      this.isSubmitting = true;
      this.clearMessages();
      
      this.settingsService.updateDisplaySettings(this.displayForm.value)
        .pipe(
          finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Display settings saved successfully!';
            
            // Apply theme if it's changed
            const theme = this.displayForm.get('theme')?.value;
            this.applyTheme(theme);
          },
          error: (err) => {
            console.error('Error saving display settings', err);
            this.error = 'Failed to save display settings. Please try again.';
          }
        });
    }
  }
  
  applyTheme(theme: 'light' | 'dark' | 'system'): void {
    // Implementation to apply theme to the application
    // This could involve adding/removing classes from the body or using a theme service
    let appliedTheme = theme;
    
    if (theme === 'system') {
      // Check system preference
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Apply the theme
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${appliedTheme}`);
  }
}
