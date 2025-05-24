import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Define AdditionalService interface if not already defined elsewhere
export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdditionalServiceService {
  private apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getAllServices(): Observable<AdditionalService[]> {
    return this.http.get<{ status: string, data: { services: AdditionalService[] } }>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data.services),
        catchError(error => {
          console.error('Error fetching additional services', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load additional services'));
        })
      );
  }

  getServiceById(id: string): Observable<AdditionalService | undefined> {
    return this.http.get<{ status: string, data: { service: AdditionalService } }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data.service),
        catchError(error => {
          console.error('Error fetching service details', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load service details'));
        })
      );
  }

  createService(service: Omit<AdditionalService, 'id' | 'createdAt' | 'updatedAt'>): Observable<AdditionalService> {
    return this.http.post<{ status: string, data: { service: AdditionalService } }>(`${this.apiUrl}`, service)
      .pipe(
        map(response => response.data.service),
        catchError(error => {
          console.error('Error creating additional service', error);
          return throwError(() => new Error(error.error?.message || 'Failed to create additional service'));
        })
      );
  }

  updateService(id: string, service: Partial<AdditionalService>): Observable<AdditionalService | undefined> {
    return this.http.put<{ status: string, data: { service: AdditionalService } }>(`${this.apiUrl}/${id}`, service)
      .pipe(
        map(response => response.data.service),
        catchError(error => {
          console.error('Error updating additional service', error);
          return throwError(() => new Error(error.error?.message || 'Failed to update additional service'));
        })
      );
  }

  deleteService(id: string): Observable<boolean> {
    return this.http.delete<{ status: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.status === 'success'),
        catchError(error => {
          console.error('Error deleting additional service', error);
          return throwError(() => new Error(error.error?.message || 'Failed to delete additional service'));
        })
      );
  }

  getActiveServices(): Observable<AdditionalService[]> {
    return this.http.get<{ status: string, data: { services: AdditionalService[] } }>(`${this.apiUrl}/active`)
      .pipe(
        map(response => response.data.services),
        catchError(error => {
          console.error('Error fetching active services', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load active services'));
        })
      );
  }

  getServicesByCategory(category: string): Observable<AdditionalService[]> {
    return this.http.get<{ status: string, data: { services: AdditionalService[] } }>(`${this.apiUrl}/category/${category}`)
      .pipe(
        map(response => response.data.services),
        catchError(error => {
          console.error('Error fetching services by category', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load services by category'));
        })
      );
  }
}
