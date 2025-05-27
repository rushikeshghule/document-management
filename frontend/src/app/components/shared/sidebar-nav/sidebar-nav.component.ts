import { Component, OnInit, HostListener, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.scss']
})
export class SidebarNavComponent implements OnInit {
  currentUser: User | null = null;
  isCollapsed = false;
  isMobileOpen = false;
  
  @Output() sidebarToggled = new EventEmitter<boolean>();
  
  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Check screen size on init and collapse sidebar if on small screen
    this.checkScreenSize();
    
    // Load sidebar state from localStorage if available
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
          this.isCollapsed = savedState === 'true';
          this.sidebarToggled.emit(this.isCollapsed);
        }
      } catch (error) {
        console.error('Error loading sidebar state:', error);
      }
    }
  }
  
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
    
    // Save to localStorage
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
      } catch (error) {
        console.error('Error saving sidebar state:', error);
      }
    }
  }
  
  toggleMobileMenu(): void {
    this.isMobileOpen = !this.isMobileOpen;
  }
  
  closeMobileMenu(): void {
    this.isMobileOpen = false;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  @HostListener('window:resize')
  checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const isMobile = window.innerWidth < 992;
      
      if (isMobile) {
        // On mobile, always collapse sidebar but don't emit (controlled by overlay)
        if (!this.isCollapsed) {
          this.isCollapsed = true;
          this.sidebarToggled.emit(true);
        }
      } else {
        // On desktop, close mobile overlay if open
        this.isMobileOpen = false;
      }
    }
  }
}
