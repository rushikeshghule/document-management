import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DocumentService, Document } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PdfViewerModule } from '../../../pdf-viewer.module';

@Component({
  selector: 'app-document-view',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NgbTooltipModule, 
    FormsModule,
    PdfViewerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss']
})
export class DocumentViewComponent implements OnInit {
  document: Document | null = null;
  loading = true;
  error = '';
  zoomLevel = 1;
  isFullscreen = false;
  showAnnotations = false;
  contentHighlighted = false;
  searchTerm = '';
  isPdfFile = false;
  pdfSrc: string | null = null;
  
  get isEditor(): boolean {
    return this.authService.isEditor();
  }
  
  get hasContent(): boolean {
    return this.document?.status === 'completed' && (!!this.document?.content || this.isPdfFile);
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
    this.error = '';
    this.isPdfFile = false;
    this.pdfSrc = null;
    
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'Document ID not found in URL';
      this.loading = false;
      return;
    }
    
    this.documentService.getDocument(id)
      .subscribe({
        next: (data) => {
          this.document = data;
          if (!data) {
            this.error = 'Document not found or returned empty data';
          } else {
            // Check if this is a PDF file
            if (data.file_type?.toLowerCase() === 'pdf' || 
                data.file_type?.toLowerCase() === 'application/pdf' || 
                data.file_url?.toLowerCase().endsWith('.pdf')) {
              this.isPdfFile = true;
              this.pdfSrc = data.file_url || null;
            }
            
            // If we're in completed status but no content, try to process again
            if (data.status === 'completed' && !data.content && !this.isPdfFile && this.isEditor) {
              this.triggerProcessing(data.id);
            }
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = `Failed to load document: ${error.message || 'Unknown error'}`;
          this.loading = false;
          console.error('Error loading document:', error);
        }
      });
  }
  
  triggerProcessing(documentId: string): void {
    this.documentService.triggerIngestion(documentId)
      .subscribe({
        next: () => {
          // Set a timer to reload the document after a few seconds
          setTimeout(() => this.loadDocument(), 5000);
        },
        error: (error) => {
          console.error('Error triggering document processing:', error);
        }
      });
  }

  zoomIn(): void {
    if (!this.hasContent) return;
    this.zoomLevel += 0.1;
  }

  zoomOut(): void {
    if (!this.hasContent) return;
    if (this.zoomLevel > 0.5) {
      this.zoomLevel -= 0.1;
    }
  }

  resetZoom(): void {
    if (!this.hasContent) return;
    this.zoomLevel = 1;
  }

  toggleFullscreen(): void {
    if (!this.hasContent) return;
    this.isFullscreen = !this.isFullscreen;
    
    if (this.isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  toggleAnnotations(): void {
    if (!this.hasContent) return;
    this.showAnnotations = !this.showAnnotations;
  }

  toggleHighlight(): void {
    if (!this.hasContent) return;
    this.contentHighlighted = !this.contentHighlighted;
  }

  downloadDocument(): void {
    if (this.document?.file_url) {
      window.open(this.document.file_url, '_blank');
    }
  }

  goBack(): void {
    if (this.document) {
      this.router.navigate(['/documents', this.document.id]);
    } else {
      this.router.navigate(['/documents']);
    }
  }

  filterContent(): string {
    if (!this.document?.content) {
      return '';
    }
    
    try {
      if (!this.searchTerm) {
        return this.document.content;
      }
      
      // This is a simple highlight implementation - in a real app you might use a library
      const regex = new RegExp(this.searchTerm, 'gi');
      return this.document.content.replace(regex, match => `<mark>${match}</mark>`);
    } catch (error) {
      console.error('Error filtering document content:', error);
      return this.document.content || '';
    }
  }
}
