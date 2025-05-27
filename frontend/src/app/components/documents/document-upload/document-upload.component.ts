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
      <div class="page-header">
        <div class="page-title">
          <h2><i class="bi bi-cloud-upload me-2"></i>Upload Document</h2>
          <p class="page-subtitle">Add a new document to your library</p>
        </div>
        <div class="page-actions">
          <a routerLink="/documents" class="btn btn-outline-primary">
            <i class="bi bi-arrow-left me-2"></i>Back to Documents
          </a>
        </div>
      </div>
      
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="upload-card">
            <div class="upload-card-header">
              <div class="step-indicator">
                <div class="step active">
                  <div class="step-number">1</div>
                  <div class="step-label">Fill Details</div>
                </div>
                <div class="step-divider"></div>
                <div class="step" [class.active]="selectedFile">
                  <div class="step-number">2</div>
                  <div class="step-label">Upload File</div>
                </div>
                <div class="step-divider"></div>
                <div class="step" [class.active]="loading">
                  <div class="step-number">3</div>
                  <div class="step-label">Processing</div>
                </div>
              </div>
            </div>
            
            <div class="upload-card-body">
              <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
                <div class="alert alert-danger" *ngIf="error">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  {{ error }}
                </div>

                <div class="form-group mb-4">
                  <label for="title" class="form-label">Document Title <span class="required">*</span></label>
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
                
                <div class="form-group mb-4">
                  <label for="description" class="form-label">Description</label>
                  <textarea 
                    id="description" 
                    formControlName="description" 
                    class="form-control"
                    rows="3"
                    placeholder="Enter document description (optional)"
                  ></textarea>
                </div>
                
                <div class="form-group mb-4">
                  <label for="file" class="form-label">Document File <span class="required">*</span></label>
                  <div class="file-upload-wrapper" [class.has-file]="selectedFile" [class.has-error]="submitted && (fileError || !selectedFile)">
                    <div class="file-upload-message">
                      <i class="bi" [class]="selectedFile ? getFileIcon(selectedFile.type) : 'bi-cloud-arrow-up'"></i>
                      <div class="upload-text">
                        <span *ngIf="!selectedFile">Drag & drop a file here or click to browse</span>
                        <span *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</span>
                        <span *ngIf="selectedFile" class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      id="file" 
                      class="file-upload-input"
                      [ngClass]="{'is-invalid': submitted && (fileError || !selectedFile)}"
                      (change)="onFileChange($event)"
                    >
                  </div>
                  <div class="form-text">
                    <i class="bi bi-info-circle me-1"></i>
                    Supported formats: PDF, DOC, DOCX, TXT. Max size: 10MB
                  </div>
                  <div *ngIf="submitted && !selectedFile" class="invalid-feedback d-block mt-2">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    Please select a file
                  </div>
                  <div *ngIf="fileError" class="invalid-feedback d-block mt-2">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    {{ fileError }}
                  </div>
                </div>
                
                <div class="form-actions">
                  <button type="button" class="btn btn-outline-secondary" routerLink="/documents">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <i *ngIf="!loading" class="bi bi-cloud-upload me-2"></i>
                    {{ loading ? 'Uploading...' : 'Upload Document' }}
                  </button>
                </div>
              </form>
            </div>
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
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1rem;
      position: relative;
    }
    
    .page-header:after {
      content: '';
      position: absolute;
      bottom: -1rem;
      left: 0;
      width: 50px;
      height: 4px;
      background: linear-gradient(to right, #4f46e5, #6366f1);
      border-radius: 2px;
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
      font-size: 1.75rem;
    }
    
    .page-title h2 i {
      color: #4f46e5;
    }
    
    .page-subtitle {
      color: #6c757d;
      margin-bottom: 0;
      font-size: 1.05rem;
    }
    
    .upload-card {
      background-color: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: none;
      overflow: hidden;
      margin-bottom: 2rem;
    }
    
    .upload-card-header {
      background-color: #f9fafb;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
    }
    
    .step-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 80px;
    }
    
    .step-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #e5e7eb;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }
    
    .step.active .step-number {
      background-color: #4f46e5;
      color: white;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
    }
    
    .step-label {
      font-size: 0.8rem;
      color: #6b7280;
      font-weight: 500;
    }
    
    .step.active .step-label {
      color: #4f46e5;
    }
    
    .step-divider {
      flex-grow: 1;
      height: 2px;
      background-color: #e5e7eb;
      margin: 0 0.5rem;
    }
    
    .upload-card-body {
      padding: 2rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
      display: block;
    }
    
    .required {
      color: #ef4444;
      margin-left: 0.25rem;
    }
    
    .form-control {
      border-radius: 8px;
      border: 1px solid #d1d5db;
      padding: 0.75rem 1rem;
      transition: all 0.3s ease;
    }
    
    .form-control:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }
    
    .file-upload-wrapper {
      position: relative;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      background-color: #f9fafb;
    }
    
    .file-upload-wrapper:hover {
      border-color: #4f46e5;
      background-color: rgba(79, 70, 229, 0.03);
    }
    
    .file-upload-wrapper.has-file {
      border-color: #10b981;
      background-color: rgba(16, 185, 129, 0.03);
    }
    
    .file-upload-wrapper.has-error {
      border-color: #ef4444;
      background-color: rgba(239, 68, 68, 0.03);
    }
    
    .file-upload-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .file-upload-message i {
      font-size: 2.5rem;
      color: #6b7280;
      margin-bottom: 1rem;
    }
    
    .file-upload-wrapper.has-file .file-upload-message i {
      color: #10b981;
    }
    
    .upload-text {
      color: #6b7280;
      font-size: 1rem;
    }
    
    .file-name {
      font-weight: 600;
      color: #111827;
      display: block;
      margin-bottom: 0.25rem;
    }
    
    .file-size {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .file-upload-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }
    
    .form-text {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    
    .invalid-feedback {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: linear-gradient(to right, #4f46e5, #6366f1);
      border: none;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(to right, #4338ca, #4f46e5);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }
    
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .btn-outline-primary {
      border: 1px solid #4f46e5;
      color: #4f46e5;
      background-color: white;
    }
    
    .btn-outline-primary:hover {
      background-color: #f5f3ff;
      border-color: #4f46e5;
      color: #4f46e5;
    }
    
    .btn-outline-secondary {
      border: 1px solid #d1d5db;
      color: #6b7280;
      background-color: white;
    }
    
    .btn-outline-secondary:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
      color: #4b5563;
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
      
      .step-indicator {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .step {
        flex-direction: row;
        width: 100%;
        align-items: center;
      }
      
      .step-number {
        margin-bottom: 0;
        margin-right: 1rem;
      }
      
      .step-divider {
        width: 2px;
        height: 24px;
        margin: 0.25rem 0 0.25rem 18px;
      }
      
      .form-actions {
        flex-direction: column-reverse;
        gap: 0.75rem;
      }
      
      .form-actions .btn {
        width: 100%;
      }
    }
  `]
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

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) {
      return 'bi-file-earmark-pdf';
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return 'bi-file-earmark-word';
    } else if (fileType.includes('text') || fileType.includes('txt')) {
      return 'bi-file-earmark-text';
    } else {
      return 'bi-file-earmark';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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