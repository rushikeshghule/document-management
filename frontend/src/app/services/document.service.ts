import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Document {
  id: string;
  name: string;
  title: string;
  description?: string;
  type: string;
  size: number;
  created_at: string;
  updated_at: string;
  last_accessed?: string;
  path: string;
  owner: string;
  uploaded_by_email?: string;
  file_size?: number;
  file_type?: string;
  file_url?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  content?: string;
}

export interface DocumentEmbedding {
  id: number;
  document: number;
  chunk_text: string;
  embedding: any;
  chunk_index: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocuments(page: number = 1, pageSize: number = 10): Observable<{results: Document[], count: number}> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    
    return this.http.get<{results: Document[], count: number}>(`${this.apiUrl}/`, { params });
  }

  getDocument(id: string | number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}/`);
  }

  getRecentDocuments(limit: number = 10): Observable<Document[]> {
    const params = new HttpParams()
      .set('sort_by', 'last_accessed')
      .set('order', 'desc')
      .set('limit', limit.toString());
    
    return this.http.get<Document[]>(`${this.apiUrl}/recent/`, { params });
  }

  uploadDocument(file: File, metadata: any): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    return this.http.post<Document>(`${this.apiUrl}/upload/`, formData);
  }

  deleteDocument(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  updateDocument(id: string | number, data: Partial<Document>): Observable<Document> {
    return this.http.patch<Document>(`${this.apiUrl}/${id}/`, data);
  }

  triggerIngestion(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/trigger_ingestion/`, {});
  }

  getDocumentEmbeddings(documentId: number): Observable<DocumentEmbedding[]> {
    return this.http.get<DocumentEmbedding[]>(`${this.apiUrl}/${documentId}/embeddings/`);
  }
} 