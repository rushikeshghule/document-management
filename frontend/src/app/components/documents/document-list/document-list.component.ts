import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentService, Document } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          <h2><i class="bi bi-file-earmark-text me-2"></i>Documents</h2>
          <p class="page-subtitle">Browse and manage your document library</p>
        </div>
        <div class="page-actions">
          <a *ngIf="isEditor" routerLink="/documents/upload" class="btn btn-primary">
            <i class="bi bi-upload me-2"></i> Upload Document
          </a>
        </div>
      </div>
      
      <div class="alert alert-danger" *ngIf="error">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
      </div>
      
      <div *ngIf="loading" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Loading documents...</p>
      </div>
      
      <div *ngIf="!loading && documents.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-file-earmark-x"></i>
        </div>
        <h3>No documents found</h3>
        <p class="empty-text">Get started by uploading your first document</p>
        <a *ngIf="isEditor" routerLink="/documents/upload" class="btn btn-primary mt-3">
          <i class="bi bi-upload me-2"></i>Upload Document
        </a>
      </div>
      
      <div class="documents-grid" *ngIf="!loading && documents.length > 0">
        <div class="document-card" *ngFor="let doc of documents">
          <div class="document-card-header">
            <div class="document-icon" [ngClass]="'file-' + (doc.file_type || 'generic')">
              <i class="bi" [ngClass]="getFileIcon(doc.file_type)"></i>
            </div>
            <div class="document-status">
              <span class="status-badge"
                    [ngClass]="{
                      'status-pending': doc.status === 'pending',
                      'status-processing': doc.status === 'processing',
                      'status-completed': doc.status === 'completed',
                      'status-failed': doc.status === 'failed'
                    }">
                {{ doc.status }}
              </span>
            </div>
          </div>
          
          <div class="document-card-body">
            <h5 class="document-title">
              <a [routerLink]="['/documents', doc.id]">{{ doc.title }}</a>
            </h5>
            <p class="document-description">{{ doc.description || 'No description' }}</p>
            <div class="document-meta">
              <div class="meta-item">
                <i class="bi bi-person me-1"></i>
                <span>{{ doc.uploaded_by_email }}</span>
              </div>
              <div class="meta-item">
                <i class="bi bi-calendar me-1"></i>
                <span>{{ doc.created_at | date:'MMM d, y' }}</span>
              </div>
            </div>
          </div>
          
          <div class="document-card-footer">
            <a [routerLink]="['/documents', doc.id]" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-eye"></i> View
            </a>
            <button *ngIf="isEditor && (doc.status === 'pending' || doc.status === 'failed')" 
                    class="btn btn-sm btn-outline-success"
                    (click)="triggerIngestion(doc)">
              <i class="bi bi-play-fill"></i> Process
            </button>
            <button *ngIf="isEditor"
                    class="btn btn-sm btn-outline-danger"
                    (click)="deleteDocument(doc.id)">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .page-title {
      margin-right: auto;
    }
    
    .page-title h2 {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      font-weight: 700;
      color: #333;
    }
    
    .page-title h2 i {
      color: #4f46e5;
    }
    
    .page-subtitle {
      color: #6c757d;
      margin-bottom: 0;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      color: #6c757d;
    }
    
    .loading-container .spinner-border {
      margin-bottom: 1rem;
      color: #4f46e5;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background-color: #f9fafb;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    
    .empty-icon {
      font-size: 4rem;
      color: #d1d5db;
      margin-bottom: 1rem;
    }
    
    .empty-state h3 {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }
    
    .empty-text {
      color: #6c757d;
      margin-bottom: 1.5rem;
    }
    
    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .document-card {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .document-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    .document-card-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .document-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background-color: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
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
    
    .document-card-body {
      padding: 1.5rem;
      flex: 1;
    }
    
    .document-title {
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }
    
    .document-title a {
      color: #333;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .document-title a:hover {
      color: #4f46e5;
    }
    
    .document-description {
      color: #6c757d;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .document-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: #6c757d;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
    }
    
    .document-card-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    @media (max-width: 767.98px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .page-actions {
        width: 100%;
        margin-top: 1rem;
      }
      
      .page-actions .btn {
        width: 100%;
      }
      
      .documents-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  loading = false;
  error = '';

  get isEditor(): boolean {
    return this.authService.isEditor();
  }

  constructor(
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    
    this.documentService.getDocuments()
      .subscribe({
        next: (data) => {
          this.documents = data.results;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load documents';
          this.loading = false;
          console.error('Error loading documents:', error);
        }
      });
  }

  triggerIngestion(document: Document): void {
    if (document.status !== 'pending' && document.status !== 'failed') {
      return;
    }
    
    this.documentService.triggerIngestion(document.id)
      .subscribe({
        next: () => {
          // Update document status in the UI
          document.status = 'processing';
        },
        error: (error) => {
          this.error = 'Failed to start document processing';
          console.error('Error triggering ingestion:', error);
        }
      });
  }

  deleteDocument(id: string): void {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    this.documentService.deleteDocument(id)
      .subscribe({
        next: () => {
          this.documents = this.documents.filter(doc => doc.id !== id);
        },
        error: (error) => {
          this.error = 'Failed to delete document';
          console.error('Error deleting document:', error);
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