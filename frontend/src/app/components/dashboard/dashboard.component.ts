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
                <div class="welcome-actions mt-3">
                  <a routerLink="/documents" class="btn btn-light-outline me-2">
                    <i class="bi bi-file-earmark-text me-2"></i>View Documents
                  </a>
                  <a *ngIf="isEditor" routerLink="/documents/upload" class="btn btn-light">
                    <i class="bi bi-cloud-upload me-2"></i>Upload New
                  </a>
                </div>
              </div>
              <div class="welcome-icon">
                <i class="bi bi-folder2-open"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-7 mb-4 mb-md-0">
          <div class="card dashboard-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Recent Documents</h5>
              <a routerLink="/documents" class="btn btn-sm btn-outline-primary">View All</a>
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
                    <div class="document-meta">
                      <span class="document-date">
                        <i class="bi bi-calendar3 me-1"></i>
                        {{doc.created_at | date:'MMM d, y'}}
                      </span>
                      <span class="document-size" *ngIf="doc.size">
                        <i class="bi bi-hdd me-1"></i>
                        {{formatFileSize(doc.size)}}
                      </span>
                    </div>
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
        
        <div class="col-md-5">
          <div class="card dashboard-card h-100">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-lightning-charge me-2"></i>Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <a routerLink="/documents" class="quick-action-card">
                  <div class="quick-action-icon browse-icon">
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
                
                <a routerLink="/documents/recent" class="quick-action-card">
                  <div class="quick-action-icon recent-icon">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div class="quick-action-text">
                    <h6>Recent Files</h6>
                    <p>View your recently accessed documents</p>
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
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 16px;
      padding: 2.5rem;
      color: white;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    
    .welcome-card:before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
      border-radius: 50%;
    }
    
    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
    }
    
    .welcome-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(to right, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .welcome-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 0;
    }
    
    .welcome-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .welcome-actions .btn {
      border-radius: 8px;
      padding: 0.5rem 1.25rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .btn-light-outline {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .btn-light-outline:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      color: white;
    }
    
    .btn-light {
      background: white;
      border: none;
      color: #1e293b;
    }
    
    .btn-light:hover {
      background: #f9fafb;
      color: #1e293b;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    
    .welcome-icon {
      font-size: 4rem;
      opacity: 0.6;
      color: rgba(255, 255, 255, 0.8);
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .dashboard-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: none;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
    }
    
    .dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
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
    
    .card-body {
      padding: 1.5rem;
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
      border-radius: 12px;
      margin-bottom: 0.75rem;
      background-color: #f9fafb;
      transition: all 0.2s ease;
      border: 1px solid rgba(0, 0, 0, 0.03);
    }
    
    .document-item:hover {
      background-color: #f3f4f6;
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    .document-icon {
      width: 46px;
      height: 46px;
      border-radius: 10px;
      background-color: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      color: #6c757d;
      font-size: 1.25rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    
    .file-pdf {
      background-color: #fee2e2;
      color: #ef4444;
    }
    
    .file-doc, .file-docx {
      background-color: #dbeafe;
      color: #3b82f6;
    }
    
    .file-xlsx, .file-xls {
      background-color: #d1fae5;
      color: #10b981;
    }
    
    .file-txt {
      background-color: #fef3c7;
      color: #f59e0b;
    }
    
    .document-info {
      flex: 1;
      min-width: 0;
    }
    
    .document-title {
      margin-bottom: 0.35rem;
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.4;
      
      .document-link {
        color: #111827;
        text-decoration: none;
        transition: color 0.2s ease;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        
        &:hover {
          color: #4f46e5;
        }
      }
    }
    
    .document-meta {
      display: flex;
      font-size: 0.8rem;
      color: #6b7280;
      gap: 1rem;
      
      i {
        font-size: 0.85rem;
      }
    }
    
    .document-status {
      margin-left: 1rem;
      
      .status-badge {
        font-size: 0.75rem;
        font-weight: 500;
        padding: 0.35em 0.65em;
        border-radius: 0.375rem;
        text-transform: capitalize;
      }
      
      .status-pending {
        background-color: #fef3c7;
        color: #d97706;
      }
      
      .status-processing {
        background-color: #dbeafe;
        color: #2563eb;
      }
      
      .status-completed {
        background-color: #d1fae5;
        color: #059669;
      }
      
      .status-failed {
        background-color: #fee2e2;
        color: #dc2626;
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 2rem 0;
      
      .empty-icon {
        font-size: 3rem;
        color: #d1d5db;
        margin-bottom: 1rem;
      }
      
      .empty-text {
        color: #6b7280;
        margin-bottom: 1rem;
      }
    }
    
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .quick-action-card {
      display: flex;
      align-items: center;
      padding: 1.25rem;
      border-radius: 12px;
      background-color: #f9fafb;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      border: 1px solid rgba(0, 0, 0, 0.03);
      
      &:hover {
        background-color: #f3f4f6;
        transform: translateX(5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }
    
    .quick-action-icon {
      width: 46px;
      height: 46px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      font-size: 1.4rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    
    .browse-icon {
      background-color: #dbeafe;
      color: #3b82f6;
    }
    
    .upload-icon {
      background-color: #d1fae5;
      color: #10b981;
    }
    
    .recent-icon {
      background-color: #e0e7ff;
      color: #6366f1;
    }
    
    .users-icon {
      background-color: #fef3c7;
      color: #f59e0b;
    }
    
    .quick-action-text {
      h6 {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      p {
        color: #6b7280;
        margin-bottom: 0;
        font-size: 0.85rem;
      }
    }
    
    @media (max-width: 767.98px) {
      .welcome-card {
        padding: 1.5rem;
      }
      
      .welcome-content {
        flex-direction: column;
        text-align: center;
      }
      
      .welcome-title {
        font-size: 1.5rem;
      }
      
      .welcome-icon {
        display: none;
      }
      
      .welcome-actions {
        justify-content: center;
        margin-top: 1.25rem;
      }
      
      .quick-action-card {
        padding: 1rem;
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
    return this.user?.role === 'admin';
  }
  
  get isEditor(): boolean {
    return this.user?.role === 'editor' || this.isAdmin;
  }

  constructor(
    private authService: AuthService, 
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.error = '';
    
    this.documentService.getDocuments()
      .subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.documents = response;
          } else if (response && 'results' in response) {
            this.documents = response.results;
          } else {
            this.documents = [];
            console.error('Unexpected response format:', response);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading documents', err);
          this.error = 'Failed to load documents. Please try again.';
          this.loading = false;
        }
      });
  }
  
  getFileIcon(fileType: string | undefined): string {
    if (!fileType) return 'bi-file-earmark';
    
    const iconMap: { [key: string]: string } = {
      'pdf': 'bi-file-earmark-pdf',
      'docx': 'bi-file-earmark-word',
      'doc': 'bi-file-earmark-word',
      'xlsx': 'bi-file-earmark-excel',
      'xls': 'bi-file-earmark-excel',
      'pptx': 'bi-file-earmark-ppt',
      'ppt': 'bi-file-earmark-ppt',
      'txt': 'bi-file-earmark-text'
    };
    
    return iconMap[fileType.toLowerCase()] || 'bi-file-earmark';
  }
  
  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }
} 