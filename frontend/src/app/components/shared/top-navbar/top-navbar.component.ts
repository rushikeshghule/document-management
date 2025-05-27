import { Component, Input, OnInit, EventEmitter, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss']
})
export class TopNavbarComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: User | null = null;
  pageTitle = 'Dashboard';
  isDropdownOpen = false;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Get page title from router events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.router.url.split('/');
      if (currentRoute.length > 1 && currentRoute[1]) {
        const route = currentRoute[1].charAt(0).toUpperCase() + currentRoute[1].slice(1);
        this.pageTitle = route;
      } else {
        this.pageTitle = 'Dashboard';
      }
    });
  }
  
  toggleMobileSidebar(): void {
    this.toggleSidebar.emit();
  }
  
  logout(): void {
    this.isDropdownOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdown when clicking outside
    if (this.isDropdownOpen && !this.elementRef.nativeElement.querySelector('.user-dropdown').contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
