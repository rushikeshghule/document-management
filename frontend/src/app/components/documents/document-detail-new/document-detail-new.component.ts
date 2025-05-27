import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DocumentService, Document } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-document-detail-new',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbTooltipModule],
  templateUrl: './document-detail-new.component.html',
  styleUrls: ['./document-detail-new.component.scss']
})
export class DocumentDetailNewComponent implements OnInit {
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
    
    this.documentService.getDocument(id)
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

  triggerIngestion(id: string): void {
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
