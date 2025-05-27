import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Upload Document</h2>
        <a routerLink="/documents" class="btn btn-outline-secondary">
          Back to Documents
        </a>
      </div>
      
      <div class="row">
        <div class="col-md-8 mx-auto">
          <div class="card">
            <div class="card-body">
              <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
                <div class="alert alert-danger" *ngIf="error">
                  {{ error }}
                </div>

                <div class="mb-3">
                  <label for="title" class="form-label">Document Title</label>
                  <input 
                    type="text" 
                    id="title" 
                    formControlName="title" 
                    class="form-control"
                    [ngClass]="{'is-invalid': submitted && f['title'].errors}"
                    placeholder="Enter document title"
                  >
                  <div *ngIf="submitted && f['title'].errors" class="invalid-feedback">
                    <div *ngIf="f['title'].errors['required']">Title is required</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea 
                    id="description" 
                    formControlName="description" 
                    class="form-control"
                    rows="3"
                    placeholder="Enter document description (optional)"
                  ></textarea>
                </div>
                
                <div class="mb-4">
                  <label for="file" class="form-label">Document File</label>
                  <input 
                    type="file" 
                    id="file" 
                    class="form-control"
                    [ngClass]="{'is-invalid': submitted && (fileError || !selectedFile)}"
                    (change)="onFileChange($event)"
                  >
                  <div class="form-text">
                    Supported formats: PDF, DOC, DOCX, TXT. Max size: 10MB
                  </div>
                  <div *ngIf="submitted && !selectedFile" class="invalid-feedback">
                    Please select a file
                  </div>
                  <div *ngIf="fileError" class="invalid-feedback">
                    {{ fileError }}
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Upload Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DocumentUploadComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  fileError = '';
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private documentService: DocumentService,
    private router: Router
  ) {
    this.uploadForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  get f() { return this.uploadForm.controls; }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    
    if (!file) {
      this.selectedFile = null;
      return;
    }
    
    // Validate file
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      this.fileError = 'Invalid file type. Supported formats: PDF, DOC, DOCX, TXT';
      this.selectedFile = null;
      return;
    }
    
    if (file.size > maxSize) {
      this.fileError = 'File size exceeds 10MB limit';
      this.selectedFile = null;
      return;
    }
    
    this.fileError = '';
    this.selectedFile = file;
  }

  onSubmit(): void {
    this.submitted = true;
    
    // Stop if form is invalid or no file selected
    if (this.uploadForm.invalid || !this.selectedFile) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    // Get form values
    const title = this.uploadForm.get('title')?.value;
    const description = this.uploadForm.get('description')?.value;
    
    // Call the document service to upload the file
    this.documentService.uploadDocument(this.selectedFile, {
      title: title,
      description: description
    }).subscribe({
      next: (response) => {
        console.log('Document uploaded successfully:', response);
        this.router.navigate(['/documents']);
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        if (error.error && typeof error.error === 'object') {
          // Handle Django REST Framework validation errors
          const errorMessages = [];
          for (const key in error.error) {
            errorMessages.push(`${key}: ${error.error[key]}`);
          }
          this.error = errorMessages.join(', ');
        } else {
          this.error = error.message || 'Failed to upload document';
        }
        this.loading = false;
      }
    });
  }
} 