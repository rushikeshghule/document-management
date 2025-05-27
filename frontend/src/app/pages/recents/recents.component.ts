import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { DocumentService, Document } from '../../services/document.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recents',
  standalone: true,
  imports: [CommonModule, DatePipe, FileSizePipe],
  templateUrl: './recents.component.html',
  styleUrls: ['./recents.component.scss']
})
export class RecentsComponent implements OnInit {
  recentFiles: Document[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRecentFiles();
  }

  loadRecentFiles(): void {
    this.isLoading = true;
    this.error = null;
    
    this.documentService.getRecentDocuments(10)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (documents) => {
          this.recentFiles = documents;
        },
        error: (err) => {
          console.error('Error loading recent documents', err);
          this.error = 'Unable to load recent documents. Please try again.';
        }
      });
  }

  getFileIcon(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      'pdf': 'bi bi-file-earmark-pdf',
      'docx': 'bi bi-file-earmark-word',
      'doc': 'bi bi-file-earmark-word',
      'xlsx': 'bi bi-file-earmark-excel',
      'xls': 'bi bi-file-earmark-excel',
      'pptx': 'bi bi-file-earmark-ppt',
      'ppt': 'bi bi-file-earmark-ppt',
      'txt': 'bi bi-file-earmark-text',
      'jpg': 'bi bi-file-earmark-image',
      'jpeg': 'bi bi-file-earmark-image',
      'png': 'bi bi-file-earmark-image',
      'gif': 'bi bi-file-earmark-image'
    };

    return iconMap[fileType.toLowerCase()] || 'bi bi-file-earmark';
  }
  
  viewDocument(documentId: string): void {
    this.router.navigate(['/documents', documentId, 'view']);
  }
  
  downloadDocument(document: Document): void {
    // Implement download logic or use a service to handle downloads
    console.log('Downloading document:', document.name);
    // In a real implementation, this would trigger a download via the backend
  }
}
