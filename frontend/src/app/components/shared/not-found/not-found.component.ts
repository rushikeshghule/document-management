import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container text-center py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h1 *ngIf="!customMessage" class="display-1 text-muted">404</h1>
              <h2 class="mb-3">{{ customMessage ? 'Coming Soon' : 'Page Not Found' }}</h2>
              <p class="mb-4">
                {{ customMessage || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.' }}
              </p>
              <div>
                <a routerLink="/dashboard" class="btn btn-primary">Return to Dashboard</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent implements OnInit {
  customMessage: string | null = null;
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.customMessage = this.route.snapshot.data['message'] || null;
  }
} 