import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-debug-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container p-3 my-3 bg-light border">
      <h4>Debug Information</h4>
      <div>
        <strong>Authentication Status:</strong> {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
      </div>
      <div *ngIf="currentUser">
        <strong>User:</strong> {{ currentUser.email }} ({{ currentUser.role }})
      </div>
      <div>
        <strong>Token:</strong> {{ hasToken ? 'Present' : 'Missing' }}
      </div>
      <div>
        <strong>Is Admin:</strong> {{ isAdmin }}
      </div>
      <button class="btn btn-sm btn-primary mt-2" (click)="refreshDebugInfo()">Refresh Info</button>
    </div>
  `,
  styles: [`
    .debug-container {
      border-radius: 8px;
      font-size: 0.9rem;
    }
  `]
})
export class DebugInfoComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  hasToken = false;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.refreshDebugInfo();
  }

  refreshDebugInfo(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.currentUserValue;
    this.hasToken = !!localStorage.getItem('accessToken');
    this.isAdmin = this.authService.isAdmin();
  }
} 