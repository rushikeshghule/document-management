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
          <div class="welcome-card">
            <div class="welcome-content">
              <div class="welcome-text">
                <h2 class="welcome-title">Welcome, {{user?.first_name || 'User'}}!</h2>
                <p class="welcome-subtitle">Your document management hub</p>
              </div>
              <div class="welcome-icon">
                <i class="bi bi-folder2-open"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-6 mb-3 mb-md-0">
          <div class="card dashboard-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Recent Documents</h5>
              <a routerLink="/documents" class="btn btn-sm btn-primary">View All</a>
            </div>
            <div class="card-body">
              <div *ngIf="loading" class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading recent documents...</p>
              </div>
              
              <div *ngIf="!loading && error" class="alert alert-danger alert-dismissible fade show">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{error}}
                <button class="btn btn-sm btn-outline-danger mt-2" (click)="loadDocuments()">
                  <i class="bi bi-arrow-clockwise me-1"></i>Retry
                </button>
              </div>
              
              <div *ngIf="!loading && !error && documents.length === 0" class="empty-state">
                <div class="empty-icon">
                  <i class="bi bi-file-earmark-text"></i>
                </div>
                <p class="empty-text">No documents found</p>
                <a *ngIf="isEditor" routerLink="/documents/upload" class="btn btn-sm btn-primary mt-2">
                  <i class="bi bi-upload me-1"></i>Upload Your First Document
                </a>
              </div>
              
              <ul class="document-list" *ngIf="!loading && !error && documents.length > 0">
                <li class="document-item" *ngFor="let doc of documents.slice(0, 5)">
                  <div class="document-icon" [ngClass]="'file-' + (doc.file_type || 'generic')">
                    <i class="bi" [ngClass]="getFileIcon(doc.file_type)"></i>
                  </div>
                  <div class="document-info">
                    <h6 class="document-title">
                      <a [routerLink]="['/documents', doc.id]" class="document-link">
                        {{doc.title}}
                      </a>
                    </h6>
                    <span class="document-date">{{doc.created_at | date:'MMM d, y'}}</span>
                  </div>
                  <div class="document-status">
                    <span class="status-badge"
                          [ngClass]="{
                            'status-pending': doc.status === 'pending',
                            'status-processing': doc.status === 'processing',
                            'status-completed': doc.status === 'completed',
                            'status-failed': doc.status === 'failed'
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
          <div class="card dashboard-card h-100">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-lightning-charge me-2"></i>Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <a routerLink="/documents" class="quick-action-card">
                  <div class="quick-action-icon">
                    <i class="bi bi-file-earmark-text"></i>
                  </div>
                  <div class="quick-action-text">
                    <h6>Browse Documents</h6>
                    <p>View and manage your document library</p>
                  </div>
                </a>
                
                <a *ngIf="isEditor" routerLink="/documents/upload" class="quick-action-card">
                  <div class="quick-action-icon upload-icon">
                    <i class="bi bi-upload"></i>
                  </div>
                  <div class="quick-action-text">
                    <h6>Upload Document</h6>
                    <p>Add new documents to your library</p>
                  </div>
                </a>
                
                <a *ngIf="isAdmin" routerLink="/users" class="quick-action-card">
                  <div class="quick-action-icon users-icon">
                    <i class="bi bi-people"></i>
                  </div>
                  <div class="quick-action-text">
                    <h6>Manage Users</h6>
                    <p>Add, edit or remove system users</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-card {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 12px;
      padding: 2rem;
      color: white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }
    
    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .welcome-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .welcome-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 0;
    }
    
    .welcome-icon {
      font-size: 3rem;
      opacity: 0.8;
    }
    
    .dashboard-card {
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: none;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      background-color: white;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding: 1.25rem 1.5rem;
      font-weight: 600;
    }
    
    .card-header h5 {
      font-weight: 600;
      font-size: 1.1rem;
      color: #333;
    }
    
    .card-header i {
      color: #4f46e5;
    }
    
    .document-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .document-item {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.75rem;
      background-color: #f9fafb;
      transition: background-color 0.2s ease;
    }
    
    .document-item:hover {
      background-color: #f3f4f6;
    }
    
    .document-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background-color: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      color: #6c757d;
    }
    
    .file-pdf {
      background-color: #ffebee;
      color: #f44336;
    }
    
    .file-doc, .file-docx {
      background-color: #e3f2fd;
      color: #2196f3;
    }
    
    .file-xlsx, .file-xls {
      background-color: #e8f5e9;
      color: #4caf50;
    }
    
    .file-txt {
      background-color: #fffde7;
      color: #ffc107;
    }
    
    .document-info {
      flex: 1;
    }
    
    .document-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }
    
    .document-link {
      color: #333;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .document-link:hover {
      color: #4f46e5;
    }
    
    .document-date {
      font-size: 0.8rem;
      color: #6c757d;
    }
    
    .empty-state {
      padding: 2rem 1rem;
      text-align: center;
    }
    
    .empty-icon {
      font-size: 3rem;
      color: #d1d5db;
      margin-bottom: 1rem;
    }
    
    .empty-text {
      color: #6c757d;
      font-size: 1rem;
    }
    
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .quick-action-card {
      display: flex;
      align-items: center;
      padding: 1rem;
      background-color: #f9fafb;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }
    
    .quick-action-card:hover {
      background-color: #f3f4f6;
      transform: translateX(5px);
    }
    
    .quick-action-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background-color: #e0e7ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-right: 1rem;
    }
    
    .upload-icon {
      background-color: #dcfce7;
      color: #10b981;
    }
    
    .users-icon {
      background-color: #ffedd5;
      color: #f97316;
    }
    
    .quick-action-text h6 {
      font-weight: 600;
      margin-bottom: 0.25rem;
      font-size: 1rem;
    }
    
    .quick-action-text p {
      font-size: 0.85rem;
      color: #6c757d;
      margin-bottom: 0;
    }
    
    @media (max-width: 767.98px) {
      .welcome-content {
        flex-direction: column;
        text-align: center;
      }
      
      .welcome-icon {
        margin-top: 1rem;
      }
      
      .quick-action-card {
        padding: 0.75rem;
      }
      
      .quick-action-icon {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
      }
    }
  `]
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
  
  getFileIcon(fileType: string | undefined): string {
    if (!fileType) return 'bi-file-earmark';
    
    switch(fileType.toLowerCase()) {
      case 'pdf': return 'bi-file-earmark-pdf';
      case 'doc':
      case 'docx': return 'bi-file-earmark-word';
      case 'xls':
      case 'xlsx': return 'bi-file-earmark-excel';
      case 'ppt':
      case 'pptx': return 'bi-file-earmark-ppt';
      case 'txt': return 'bi-file-earmark-text';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'bi-file-earmark-image';
      default: return 'bi-file-earmark';
    }
  }
} 