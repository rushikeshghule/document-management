import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DocumentService, Document } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbTooltipModule],
  template: `
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Document Details</h2>
        <div>
          <a routerLink="/documents" class="btn btn-outline-secondary me-2">
            Back to Documents
          </a>
          <a [routerLink]="['/documents', document?.id, 'view']" class="btn btn-primary" *ngIf="document?.status === 'completed'">
            View Document
          </a>
        </div>
      </div>
      
      <div class="alert alert-danger" *ngIf="error">
        {{ error }}
      </div>
      
      <div *ngIf="loading" class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <ng-container *ngIf="!loading && document">
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between">
            <h3 class="h5 mb-0">{{ document.title }}</h3>
            <span class="badge rounded-pill"
                  [ngClass]="{
                    'bg-warning text-dark': document.status === 'pending',
                    'bg-info text-white': document.status === 'processing',
                    'bg-success': document.status === 'completed',
                    'bg-danger': document.status === 'failed'
                  }">
              {{ document.status }}
            </span>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <p class="mb-1"><strong>Uploaded by:</strong> {{ document.uploaded_by_email }}</p>
                <p class="mb-1"><strong>Uploaded on:</strong> {{ document.created_at | date:'medium' }}</p>
                <p class="mb-1" *ngIf="document.updated_at"><strong>Last updated:</strong> {{ document.updated_at | date:'medium' }}</p>
              </div>
              <div class="col-md-6">
                <p class="mb-1"><strong>Status:</strong> {{ document.status }}</p>
                <p class="mb-1" *ngIf="document.file_size"><strong>File Size:</strong> {{ formatFileSize(document.file_size) }}</p>
                <p class="mb-1" *ngIf="document.file_type"><strong>File Type:</strong> {{ document.file_type }}</p>
              </div>
            </div>

            <h5>Description</h5>
            <p>{{ document.description || 'No description provided' }}</p>

            <div class="mt-4" *ngIf="isEditor">
              <h5>Actions</h5>
              <div class="btn-group">
                <button 
                  *ngIf="document.status === 'pending' || document.status === 'failed'" 
                  class="btn btn-outline-primary"
                  (click)="triggerIngestion(document.id)">
                  <i class="bi bi-play-fill"></i> Process Document
                </button>
                <a [href]="document.file_url" target="_blank" class="btn btn-outline-secondary" *ngIf="document.file_url" ngbTooltip="Download Original">
                  <i class="bi bi-download"></i> Download Original
                </a>
                <button class="btn btn-outline-danger" (click)="deleteDocument()" ngbTooltip="Delete Document">
                  <i class="bi bi-trash"></i> Delete Document
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card" *ngIf="document.status === 'completed' && document.content">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Document Content Preview</h5>
            <a [routerLink]="['/documents', document.id, 'view']" class="btn btn-sm btn-outline-primary">
              Open Full Viewer
            </a>
          </div>
          <div class="card-body">
            <div class="document-content">
              <pre>{{ document.content.substring(0, 500) }}{{ document.content.length > 500 ? '...' : '' }}</pre>
            </div>
          </div>
        </div>
        
        <div class="alert alert-info" *ngIf="document.status !== 'completed'">
          <p *ngIf="document.status === 'pending'">
            This document is pending processing. Click the "Process Document" button to extract the content.
          </p>
          <p *ngIf="document.status === 'processing'">
            This document is currently being processed. The content will be available once processing is complete.
          </p>
          <p *ngIf="document.status === 'failed'">
            Processing of this document failed. Please try processing it again or contact support.
          </p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .document-content {
      max-height: 300px;
      overflow-y: auto;
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 0.25rem;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class DocumentDetailComponent implements OnInit {
  document: Document | null = null;
  loading = false;
  error = '';
  
  get isEditor(): boolean {
    return this.authService.isEditor();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDocument();
  }

  loadDocument(): void {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'Document ID not found';
      this.loading = false;
      return;
    }
    
    this.documentService.getDocument(+id)
      .subscribe({
        next: (data) => {
          this.document = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load document';
          this.loading = false;
          console.error('Error loading document:', error);
        }
      });
  }

  triggerIngestion(id: number): void {
    this.documentService.triggerIngestion(id)
      .subscribe({
        next: () => {
          if (this.document) {
            this.document.status = 'processing';
          }
        },
        error: (error) => {
          this.error = 'Failed to start document processing';
          console.error('Error triggering ingestion:', error);
        }
      });
  }

  deleteDocument(): void {
    if (!this.document || !confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    this.documentService.deleteDocument(this.document.id)
      .subscribe({
        next: () => {
          this.router.navigate(['/documents']);
        },
        error: (error) => {
          this.error = 'Failed to delete document';
          console.error('Error deleting document:', error);
        }
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
} 