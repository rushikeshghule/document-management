import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="logo-section">
          <i class="bi bi-folder2-open"></i>
          <h2>DocManager</h2>
        </div>
        
        <h3 class="text-center mb-4">Sign Up</h3>
        
        <div class="alert alert-danger" *ngIf="error">
          {{ error }}
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="first_name" 
                class="form-control"
                placeholder="Enter your first name"
              >
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="last_name" 
                class="form-control"
                placeholder="Enter your last name"
              >
            </div>
          </div>
          
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
          
          <div class="mb-3">
            <label for="role" class="form-label">Account Type</label>
            <select
              id="role"
              formControlName="role"
              class="form-control"
              [ngClass]="{'is-invalid': submitted && f['role'].errors}"
            >
              <option value="viewer">Viewer (View documents only)</option>
              <option value="editor">Editor (Upload and manage documents)</option>
            </select>
            <small class="form-text text-white-50">Note: Admin accounts can only be created by existing administrators.</small>
          </div>
          
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              [ngClass]="{'is-invalid': submitted && f['password'].errors}"
              placeholder="Enter your password"
              autocomplete="new-password"
            >
            <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
              <div *ngIf="f['password'].errors['required']">Password is required</div>
              <div *ngIf="f['password'].errors['minlength']">Password must be at least 8 characters</div>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="password_confirm" 
              class="form-control"
              [ngClass]="{'is-invalid': submitted && f['password_confirm'].errors}"
              placeholder="Confirm your password"
              autocomplete="new-password"
            >
            <div *ngIf="submitted && f['password_confirm'].errors" class="invalid-feedback">
              <div *ngIf="f['password_confirm'].errors['required']">Confirm Password is required</div>
              <div *ngIf="f['password_confirm'].errors['mustMatch']">Passwords must match</div>
            </div>
          </div>
          
          <div class="d-grid gap-2 mb-4">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sign Up
            </button>
          </div>
          
          <div class="text-center">
            <p class="mb-0 text-white">Already have an account? <a routerLink="/login" class="text-white fw-bold">Sign In</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      width: 100%;
      max-width: 500px;
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      first_name: [''],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      role: ['viewer', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirm: ['', Validators.required]
    }, {
      validators: this.mustMatch('password', 'password_confirm')
    });
  }

  // Getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  // Password matching validator
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit(): void {
    this.submitted = true;
    
    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/login'], { queryParams: { registered: true } });
        },
        error: (error) => {
          this.error = error.message || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
  }
} 