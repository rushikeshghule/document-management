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
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Documents</h2>
        <div>
          <a *ngIf="isEditor" routerLink="/documents/upload" class="btn btn-primary">
            <i class="bi bi-upload me-2"></i> Upload Document
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
      
      <div *ngIf="!loading && documents.length === 0" class="text-center p-5">
        <p class="text-muted">No documents found.</p>
        <a *ngIf="isEditor" routerLink="/documents/upload" class="btn btn-outline-primary">Upload your first document</a>
      </div>
      
      <div class="table-responsive" *ngIf="!loading && documents.length > 0">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Uploaded By</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of documents">
              <td>
                <a [routerLink]="['/documents', doc.id]">{{ doc.title }}</a>
              </td>
              <td>{{ doc.description || 'No description' }}</td>
              <td>{{ doc.uploaded_by_email }}</td>
              <td>{{ doc.created_at | date:'short' }}</td>
              <td>
                <span class="badge rounded-pill"
                      [ngClass]="{
                        'bg-warning text-dark': doc.status === 'pending',
                        'bg-info text-white': doc.status === 'processing',
                        'bg-success': doc.status === 'completed',
                        'bg-danger': doc.status === 'failed'
                      }">
                  {{ doc.status }}
                </span>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <a [routerLink]="['/documents', doc.id]" class="btn btn-outline-primary">
                    <i class="bi bi-eye"></i> View
                  </a>
                  <button *ngIf="isEditor && doc.status === 'pending' || doc.status === 'failed'" 
                          class="btn btn-outline-success"
                          (click)="triggerIngestion(doc)">
                    <i class="bi bi-play-fill"></i> Process
                  </button>
                  <button *ngIf="isEditor"
                          class="btn btn-outline-danger"
                          (click)="deleteDocument(doc.id)">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
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
} 