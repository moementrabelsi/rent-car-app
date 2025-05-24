import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Upload profile image to the server
   * @param file The image file to upload
   * @returns Observable with the upload response containing the image path
   */
  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profileImage', file);

    // Try the standard endpoint first
    return this.http.post(`${this.apiUrl}/profile-images/upload`, formData)
      .pipe(
        catchError(error => {
          console.error('Error with primary upload endpoint:', error);
          
          // If the first endpoint fails, try an alternative one
          // Some APIs use /users/upload-profile-image or /upload/profile-image
          return this.http.post(`${this.apiUrl}/users/upload-profile-image`, formData)
            .pipe(
              catchError(secondError => {
                console.error('Error with secondary upload endpoint:', secondError);
                return throwError(() => new Error('Failed to upload profile image. The server might be unavailable.'));
              })
            );
        })
      );
  }

  /**
   * Get the full URL for a profile image
   * @param imagePath The relative path of the image from the server
   * @returns The full URL to the image
   */
  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // If the path already includes the API URL or is a complete URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Ensure we don't have double slashes in the URL
    if (imagePath.startsWith('/')) {
      imagePath = imagePath.substring(1);
    }
    
    // For paths that include 'uploads/', make sure we're using the base URL, not the API URL
    if (imagePath.includes('uploads/')) {
      // Extract base URL (without /api)
      const baseUrl = this.apiUrl.split('/api')[0];
      return `${baseUrl}/${imagePath}`;
    }
    
    // If the path is relative, append to the API URL
    return `${this.apiUrl}/${imagePath}`;
  }
  
  /**
   * Get the full URL for a car image
   * @param imagePath The relative path of the image from the server
   * @returns The full URL to the image
   */
  getCarImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // If the path already includes the API URL or is a complete URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Extract base URL (without /api)
    const baseUrl = this.apiUrl.split('/api')[0];
    
    // Ensure we don't have double slashes in the URL
    if (imagePath.startsWith('/')) {
      imagePath = imagePath.substring(1);
    }
    
    // Return the full URL with the base URL (not the API URL)
    return `${baseUrl}/uploads/${imagePath}`;
  }
  
  /**
   * Get the full URL for a user profile image
   * @param userImage The user image path or filename
   * @returns The full URL to the user profile image
   */
  getUserProfileImageUrl(userImage: string | null): string {
    if (!userImage) return '';
    
    // Check if it's already a full URL (starts with http or https)
    if (userImage.startsWith('http://') || userImage.startsWith('https://')) {
      return userImage;
    }
    
    // Extract base URL (without /api)
    const baseUrl = this.apiUrl.split('/api')[0];
    
    // If the path already includes 'uploads/' folder, use it as is
    if (userImage.includes('uploads/')) {
      return `${baseUrl}/${userImage}`;
    }
    
    // If the path already includes 'profile/' folder, add uploads
    if (userImage.includes('profile/')) {
      return `${baseUrl}/uploads/${userImage}`;
    }
    
    // Default to the profile directory
    return `${baseUrl}/uploads/profile/${userImage}`;
  }
}
