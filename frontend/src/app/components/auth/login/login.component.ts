import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="logo-section">
          <i class="bi bi-folder2-open"></i>
          <h2>DocManager</h2>
        </div>
        
        <h3 class="text-center mb-4">Sign In</h3>
        
        <div class="alert alert-danger" *ngIf="error">
          {{ error }}
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              [ngClass]="{'is-invalid': submitted && f['email'].errors}"
              placeholder="Enter your email" 
              autocomplete="email"
            >
            <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
              <div *ngIf="f['email'].errors['required']">Email is required</div>
              <div *ngIf="f['email'].errors['email']">Email must be valid</div>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="password" class="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              [ngClass]="{'is-invalid': submitted && f['password'].errors}"
              placeholder="Enter your password"
              autocomplete="current-password"
            >
            <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
              <div *ngIf="f['password'].errors['required']">Password is required</div>
            </div>
          </div>
          
          <div class="d-grid gap-2 mb-4">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sign In
            </button>
          </div>
          
          <div class="text-center">
            <p class="mb-0 text-white">Don't have an account? <a routerLink="/register" class="text-white fw-bold">Sign Up</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      width: 100%;
      max-width: 450px;
      padding: 1rem;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 100%;
    }
    
    .auth-card {
      background-color: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      color: white;
    }
    
    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
      
      i {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      
      h2 {
        font-weight: 700;
        margin: 0;
      }
    }
    
    .form-label {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }
    
    .form-control {
      background-color: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 0.8rem 1rem;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
      
      &:focus {
        background-color: rgba(255, 255, 255, 0.25);
        box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.15);
        color: white;
      }
    }
    
    .btn-primary {
      background-color: white;
      color: var(--primary-color);
      border: none;
      font-weight: 600;
      padding: 0.8rem;
      
      &:hover, &:focus {
        background-color: rgba(255, 255, 255, 0.9);
        color: var(--primary-dark);
      }
      
      &:disabled {
        background-color: rgba(255, 255, 255, 0.5);
        color: var(--primary-color);
      }
    }
    
    a {
      text-decoration: none;
      transition: all 0.2s ease;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .invalid-feedback {
      color: #ffcccc;
    }
    
    .alert-danger {
      background-color: rgba(220, 53, 69, 0.2);
      color: #ffcccc;
      border: 1px solid rgba(220, 53, 69, 0.3);
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // Getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    
    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password)
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.error = error.message || 'Login failed. Please try again.';
          this.loading = false;
        }
      });
  }
} 