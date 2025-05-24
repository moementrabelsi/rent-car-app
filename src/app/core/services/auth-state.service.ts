import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Global service to maintain consistent authentication state across the application
 * This helps prevent scenarios where components show "not logged in" messages
 * even when user data is available
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private authService: AuthService) {
    // Initialize authentication state
    this.updateAuthState();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.updateAuthState();
    });
  }

  /**
   * Update the authentication state based on both token and user object
   */
  private updateAuthState(): void {
    const token = this.authService.getToken();
    const user = this.authService.currentUserValue;
    
    // Consider authenticated only if both token and user object exist
    const isAuthenticated = !!token && !!user;
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  /**
   * Get the current authentication state
   */
  get isUserAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
