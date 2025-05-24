import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private readonly apiBaseUrl: string;

  constructor() {
    // Extract base URL from API URL
    // Remove '/api' from the end if present
    this.apiBaseUrl = environment.apiUrl.replace(/\/api$/, '');
    console.log('Using API base URL:', this.apiBaseUrl);
  }

  /**
   * Get the base URL for API requests
   */
  getApiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Get the base URL for uploads and other resources
   */
  getBaseUrl(): string {
    return this.apiBaseUrl;
  }

  /**
   * Get the complete URL for an upload resource
   */
  getUploadsUrl(path: string = ''): string {
    return `${this.apiBaseUrl}/uploads/${path}`;
  }

  /**
   * Get a fallback image URL
   */
  getFallbackImageUrl(): string {
    return `${this.apiBaseUrl}/uploads/1747396263436_2855267.jpg`;
  }
}
