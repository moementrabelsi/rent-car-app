import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { 
    const storedUser = localStorage.getItem(this.userKey);
    let user: User | null = null;
    if (storedUser && storedUser !== "undefined") {
      try {
        user = JSON.parse(storedUser);
      } catch {
        user = null;
        localStorage.removeItem(this.userKey);
      }
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  signIn(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          // Handle nested response structure from backend
          const token = response.token;
          // Check if user is in response.user or response.data.user
          const backendUser = response.user || (response.data && response.data.user);
          
          if (!backendUser) {
            throw new Error('User data not found in response');
          }
          
          console.log('Auth token:', token);
          console.log('User data:', backendUser);
          
          // Convert backend user model to frontend user model
          const frontendUser = {
            ...backendUser,
            // Convert _id to id if needed
            id: backendUser.id || backendUser._id,
            // Split name into firstName and lastName
            firstName: backendUser.name?.split(' ')[0] || 'User',
            lastName: backendUser.name?.split(' ').slice(1).join(' ') || ''
          };
          
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, JSON.stringify(frontendUser));
          this.currentUserSubject.next(frontendUser);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Invalid email or password'));
        })
      );
  }

  signUp(user: Partial<User>): Observable<AuthResponse> {
    // Set the role to customer by default
    const newUser = { ...user, role: 'customer' };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, newUser)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }

  signOut(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.currentUserValue;
    
    // Check both the token and the user object exist
    return !!token && !!user;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  isLoggedIn(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }
  
  /**
   * Send a password reset email to the user
   * @param email The user's email address
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ status: string, message: string }>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        map(response => ({ message: response.message })),
        catchError(error => {
          console.error('Error in forgot password request:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to send password reset email'));
        })
      );
  }
  
  /**
   * Reset password using token from email
   * @param token The password reset token from the email
   * @param password The new password
   */
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    // Send both password and confirmPassword to satisfy backend validation
    return this.http.patch<{ status: string, message: string }>(`${this.apiUrl}/reset-password/${token}`, { 
      password,
      confirmPassword: password // Match the confirmPassword field required by backend validator
    })
      .pipe(
        map(response => ({ message: response.message })),
        catchError(error => {
          console.error('Error in reset password request:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to reset password'));
        })
      );
  }
}