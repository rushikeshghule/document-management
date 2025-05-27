import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container text-center py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card border-danger">
            <div class="card-header bg-danger text-white">
              <h3 class="mb-0">Access Denied</h3>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <i class="bi bi-lock-fill text-danger" style="font-size: 4rem;"></i>
              </div>
              <h4>Unauthorized Access</h4>
              <p class="mb-4">
                You do not have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              <div>
                <a routerLink="/" class="btn btn-primary me-2">Go to Dashboard</a>
                <button class="btn btn-outline-secondary" (click)="goBack()">Go Back</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {
  goBack(): void {
    window.history.back();
  }
} 