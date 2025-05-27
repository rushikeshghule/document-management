import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { DocumentService, Document } from '../../services/document.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title">Welcome, {{user?.first_name || 'User'}}!</h2>
              <p class="card-text">This is the Document Management System dashboard. Use the navigation menu to access different features.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-6 mb-3 mb-md-0">
          <div class="card h-100">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Recent Documents</h5>
              <a routerLink="/documents" class="btn btn-sm btn-light">View All</a>
            </div>
            <div class="card-body">
              <div *ngIf="loading" class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading recent documents...</p>
              </div>
              
              <div *ngIf="!loading && error" class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{error}}
                <button class="btn btn-sm btn-outline-danger mt-2" (click)="loadDocuments()">
                  <i class="bi bi-arrow-clockwise me-1"></i>Retry
                </button>
              </div>
              
              <div *ngIf="!loading && !error && documents.length === 0" class="text-center p-4">
                <i class="bi bi-file-earmark-text mb-3" style="font-size: 2rem; opacity: 0.5;"></i>
                <p class="text-muted">No documents found.</p>
                <a *ngIf="isEditor" routerLink="/documents/upload" class="btn btn-sm btn-primary mt-2">
                  <i class="bi bi-upload me-1"></i>Upload Your First Document
                </a>
              </div>
              
              <ul class="list-group list-group-flush" *ngIf="!loading && !error && documents.length > 0">
                <li class="list-group-item" *ngFor="let doc of documents.slice(0, 5)">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-0">
                        <a [routerLink]="['/documents', doc.id]" class="text-decoration-none">
                          {{doc.title}}
                        </a>
                      </h6>
                      <small class="text-muted">{{doc.created_at | date:'medium'}}</small>
                    </div>
                    <span class="badge rounded-pill"
                          [ngClass]="{
                            'bg-warning text-dark': doc.status === 'pending',
                            'bg-info text-white': doc.status === 'processing',
                            'bg-success': doc.status === 'completed',
                            'bg-danger': doc.status === 'failed'
                          }">
                      {{doc.status}}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <a routerLink="/documents" class="btn btn-outline-primary">
                  <i class="bi bi-file-earmark-text me-2"></i>Browse Documents
                </a>
                <a *ngIf="isEditor" routerLink="/documents/upload" class="btn btn-outline-success">
                  <i class="bi bi-upload me-2"></i>Upload New Document
                </a>
                <a *ngIf="isAdmin" routerLink="/users" class="btn btn-outline-secondary">
                  <i class="bi bi-people me-2"></i>Manage Users
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  documents: Document[] = [];
  loading = false;
  error = '';
  
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  get isEditor(): boolean {
    return this.authService.isEditor();
  }

  constructor(
    private authService: AuthService, 
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.error = '';
    
    this.documentService.getRecentDocuments(5)
      .subscribe({
        next: (data) => {
          this.documents = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load documents. Please try again later.';
          this.loading = false;
          console.error('Error loading documents:', error);
        }
      });
  }
} 