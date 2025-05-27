// This comment forces a rebuild to fix the sidebarCollapsed binding issue
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarNavComponent } from './components/shared/sidebar-nav/sidebar-nav.component';
import { TopNavbarComponent } from './components/shared/top-navbar/top-navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarNavComponent, TopNavbarComponent],
  template: `
    <div class="app-container" [ngClass]="{'auth-layout': isAuthPage}">
      <app-sidebar-nav 
        *ngIf="!isAuthPage" 
        (sidebarToggled)="onSidebarToggled($event)" 
        #sidebar
      ></app-sidebar-nav>
      
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed" [class.full-width]="isAuthPage">
        <app-top-navbar 
          *ngIf="!isAuthPage" 
          [sidebarCollapsed]="sidebarCollapsed"
          (toggleSidebar)="toggleSidebar()"
        ></app-top-navbar>
        
        <main class="content-area" [class.auth-content]="isAuthPage">
          <div class="content-wrapper" [class.auth-wrapper]="isAuthPage">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary-color: #4f46e5;
      --primary-dark: #4338ca;
      --primary-light: #6366f1;
      --body-bg: #f9fafb;
      --card-bg: #ffffff;
      --text-color: #111827;
      --border-color: rgba(0, 0, 0, 0.1);
      --transition-duration: 0.3s;
    }
    
    .app-container {
      display: flex;
      min-height: 100vh;
      width: 100%;
      overflow-x: hidden;
      background-color: var(--body-bg);
      color: var(--text-color);
    }
    
    .auth-layout {
      background: linear-gradient(135deg, #4f46e5, #4338ca);
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 260px;
      transition: margin-left var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
      min-height: 100vh;
      position: relative;
    }
    
    .main-content.sidebar-collapsed {
      margin-left: 70px;
    }
    
    .main-content.full-width {
      margin-left: 0;
    }
    
    .content-area {
      flex: 1;
      padding: 24px;
      margin-top: 70px;
      overflow-y: auto;
      transition: all var(--transition-duration) ease;
    }
    
    .auth-content {
      margin-top: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem 0;
    }
    
    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: 1.5rem;
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.06);
    }
    
    .auth-wrapper {
      background: transparent;
      box-shadow: none;
      max-width: 100%;
    }
    
    @media (max-width: 991.98px) {
      .main-content {
        margin-left: 0 !important;
      }
      
      .content-wrapper {
        padding: 1rem;
      }
    }
    
    @media (max-width: 767.98px) {
      .content-area {
        padding: 16px;
      }
      
      .content-wrapper {
        padding: 0.75rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Document Management System';
  sidebarCollapsed = false;
  isAuthPage = false;
  private platformId = inject(PLATFORM_ID);
  
  constructor(private router: Router) {
    // Subscribe to router events to check if current route is login or register
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isAuthPage = url.includes('/login') || url.includes('/register');
    });
  }
  
  ngOnInit(): void {
    // Load sidebar state from localStorage if available
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
          this.sidebarCollapsed = savedState === 'true';
        }
      } catch (error) {
        console.error('Error loading sidebar state:', error);
      }
    }
  }
  
  onSidebarToggled(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    
    // Save sidebar state to localStorage if available
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('sidebarCollapsed', String(this.sidebarCollapsed));
      } catch (error) {
        console.error('Error saving sidebar state:', error);
      }
    }
  }
}
