import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../services/auth.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <div>
          <button class="btn btn-primary" (click)="refreshUserList()">
            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
      </div>
      
      <div class="alert alert-danger" *ngIf="error">
        {{ error }}
      </div>
      
      <div *ngIf="loading" class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading users...</p>
      </div>
      
      <div *ngIf="!loading && users.length === 0 && !error" class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        <span>No users found. Make sure you have administrator privileges.</span>
      </div>
      
      <div class="table-responsive" *ngIf="!loading && users.length > 0">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.first_name }} {{ user.last_name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge rounded-pill"
                      [ngClass]="{
                        'bg-danger': user.role === 'admin',
                        'bg-primary': user.role === 'editor',
                        'bg-secondary': user.role === 'viewer'
                      }">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ user.last_login | date:'short' }}</td>
              <td>
                <span class="badge rounded-pill"
                      [ngClass]="{
                        'bg-success': user.is_active,
                        'bg-danger': !user.is_active
                      }">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button 
                    class="btn btn-outline-primary"
                    (click)="editUser(user)">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button 
                    class="btn" 
                    [ngClass]="user.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                    (click)="toggleUserStatus(user)">
                    <i class="bi" [ngClass]="user.is_active ? 'bi-person-x' : 'bi-person-check'"></i>
                    {{ user.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Edit User Modal -->
      <div class="modal fade" id="editUserModal" tabindex="-1" *ngIf="selectedUser">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit User</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- Edit form would go here -->
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  loading = false;
  error = '';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    this.userService.getUsers()
      .subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
          
          if (this.users.length === 0) {
            this.error = 'No users found. Please check your administrator privileges.';
          }
        },
        error: (error) => {
          this.error = `Failed to load users: ${error.message || error.statusText || 'Unknown error'}`;
          if (error.status === 403) {
            this.error += ' You do not have permission to view the user list.';
          }
          this.loading = false;
        }
      });
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    // In a real app, you would open the modal here
    // Example: this.modalService.open('editUserModal');
  }

  toggleUserStatus(user: User): void {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} user ${user.email}?`)) {
      return;
    }
    
    this.userService.updateUserStatus(user.id, !user.is_active)
      .subscribe({
        next: (response) => {
          user.is_active = !user.is_active;
        },
        error: (error) => {
          this.error = `Failed to ${action} user: ${error.message || error.statusText || 'Unknown error'}`;
        }
      });
  }

  refreshUserList(): void {
    this.loadUsers();
  }
} 