import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/interfaces/user.interface';
import { Observable } from 'rxjs';
import {
  faUser,
  faUserShield,
  faClipboardList,
  faSignOutAlt,
  faBars,
  faCar,
  faCalendarAlt,
  faHome,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule]
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isMenuOpen = false;
  isUserMenuOpen = false;
  isAuthenticated = false;
  isAdminUser = false;
  logoFailed = false;
  
  // Icons
  faUser = faUser;
  faUserShield = faUserShield;
  faClipboardList = faClipboardList;
  faSignOutAlt = faSignOutAlt;
  faBars = faBars;
  faCar = faCar;
  faCalendarAlt = faCalendarAlt;
  faHome = faHome;
  faUserCircle = faUserCircle;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }
  
  ngOnInit(): void {
    // Initialize authentication state
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.isAdminUser = user?.role === 'admin';
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isUserMenuOpen = false;
  }

  signOut() {
    this.authService.signOut();
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  onLogoError() {
    console.log('Logo failed to load');
    this.logoFailed = true;
  }
}
