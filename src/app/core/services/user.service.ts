import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserActivity } from '../interfaces/user.interface';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { FileUploadService } from './file-upload.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private profileImageUrl = `${environment.apiUrl}/profile-images`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private fileUploadService: FileUploadService
  ) {}

  getCurrentUser(): Observable<User> {
    return this.http.get<{ status: string, data: { user: User } }>(`${this.apiUrl}/me`)
      .pipe(
        map(response => {
          const user = response.data.user;
          // Map backend user to frontend User model
          return {
            ...user,
            // Make sure ID is properly mapped
            id: user.id || user._id,
            // Split name into firstName/lastName if needed
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || ''
          } as User;
        }),
        catchError(error => {
          console.error('Error fetching user details', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load user details'));
        })
      );
  }

  getUserById(id: string): Observable<User | undefined> {
    // For admin purposes only
    return this.http.get<{ status: string, data: { user: User } }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          const user = response.data.user;
          return {
            ...user,
            id: user.id || user._id,
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || ''
          } as User;
        }),
        catchError(error => {
          console.error('Error fetching user details', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load user details'));
        })
      );
  }

  updateProfile(user: Partial<User>): Observable<User> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http.patch<{ status: string, data: { user: User } }>(`${this.apiUrl}/me`, user)
      .pipe(
        map(response => response.data.user),
        tap(updatedUser => {
          // Update local cache after successful profile update
          this.updateUserProfileCache(updatedUser);
        }),
        catchError(error => {
          console.error('Error updating user profile', error);
          return throwError(() => new Error(error.error?.message || 'Failed to update profile'));
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http.patch<{ status: string }>(`${this.apiUrl}/me/password`, {
      currentPassword,
      newPassword
    }).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Error changing password', error);
        return throwError(() => new Error(error.error?.message || 'Failed to change password'));
      })
    );
  }

  /**
   * Get activities for the current user
   */
  getUserActivities(): Observable<UserActivity[]> {
    return this.http.get<{ status: string, data: { activities: UserActivity[] } }>(`${environment.apiUrl}/activities/me`)
      .pipe(
        map(response => response.data.activities),
        catchError(error => {
          console.error('Error fetching user activities', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load activities'));
        })
      );
  }
  
  /**
   * Legacy method for backward compatibility
   * @deprecated Use getUserActivities instead
   */
  getRecentActivity(): Observable<UserActivity[]> {
    return this.getUserActivities();
  }

  getUsers(): Observable<User[]> {
    return this.http.get<{ status: string, data: { users: User[] } }>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data.users),
        catchError(error => {
          console.error('Error fetching users', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load users'));
        })
      );
  }

  /**
   * Get the full profile image URL for a user
   * @param userId The user's ID (optional, defaults to current user)
   */
  getProfileImageUrl(userId?: string): Observable<string | null> {
    const endpoint = userId ? `${this.profileImageUrl}/${userId}` : `${this.profileImageUrl}/me`;
    
    return this.http.get<{ status: string, data: { profileImage: string } }>(endpoint)
      .pipe(
        map(response => {
          const imagePath = response.data.profileImage;
          return this.fileUploadService.getFullImageUrl(imagePath);
        }),
        catchError(error => {
          console.log('No profile image or error fetching image:', error);
          return of(null); // Return null if no image or error
        })
      );
  }

  /**
   * Update the user's profile data in local storage after a profile change
   * @param updatedUser Updated user data including profile image
   */
  updateUserProfileCache(updatedUser: Partial<User>): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      const userKey = 'current_user'; // Same key used in AuthService
      // Create type-safe updated user data with appropriate role handling
      const updatedUserData: User = {
        ...currentUser,
        ...updatedUser,
        // Ensure role is compatible - convert 'user' to 'customer' if needed
        role: updatedUser.role === 'user' ? 'customer' : (updatedUser.role || currentUser.role)
      };
      
      localStorage.setItem(userKey, JSON.stringify(updatedUserData));
      
      // Update the behavior subject in auth service if possible
      if (typeof this.authService['currentUserSubject']?.next === 'function') {
        // Ensure all required fields are present before updating the subject
        if (updatedUserData.firstName && updatedUserData.lastName && updatedUserData.email) {
          this.authService['currentUserSubject'].next(updatedUserData as any);
        }
      }
    }
  }
  
  /**
   * Get user data from auth service as a fallback when the profile API fails
   */
  getFallbackUserFromAuth(): User | null {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return null;
    }
    
    // Return the user from auth service with proper type mapping
    return {
      id: currentUser.id || (currentUser as any)._id || '',
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      name: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
      email: currentUser.email,
      phone: currentUser.phone || '',
      address: (currentUser as any).address || '',
      role: currentUser.role || 'customer',
      createdAt: currentUser.createdAt || new Date(),
    };
  }
}