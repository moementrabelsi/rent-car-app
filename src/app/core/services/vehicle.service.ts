import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Car } from '../models/car.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/cars`;

  constructor(private http: HttpClient) {}

  // Get auth headers with the correct token format
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
    
    if (!token) {
      console.warn('No auth token found in localStorage');
      return new HttpHeaders();
    }
    
    // Create headers with the token
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getVehicles(): Observable<Car[]> {
    const headers = this.getAuthHeaders();
    console.log('Getting vehicles with headers:', headers);
    
    return this.http.get<{ status: string, data: { cars: Car[] } }>(`${this.apiUrl}`, { headers })
      .pipe(
        map(response => response.data.cars),
        catchError(error => {
          console.error('Error fetching vehicles', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load vehicles'));
        })
      );
  }

  getVehicleById(id: string): Observable<Car | undefined> {
    console.log('Fetching vehicle with ID:', id);
    
    if (!id || id === 'null' || id === 'undefined' || id === '') {
      console.error('Invalid vehicle ID');
      return throwError(() => new Error('Invalid vehicle ID'));
    }
    
    // Ensure ID is properly formatted and sanitized
    id = id.trim();
    
    // Try to fetch from proper endpoint format
    const url = `${this.apiUrl}/${id}`;
    console.log('Requesting vehicle from URL:', url);
    
    const headers = this.getAuthHeaders();
    console.log('Getting vehicle with headers:', headers);
    
    return this.http.get<any>(url, { headers })
      .pipe(
        map(response => {
          console.log('Response received:', response);
          if (response.data && response.data.car) {
            console.log('Vehicle data extracted:', response.data.car);
            return response.data.car;
          } else if (response.car) {
            console.log('Vehicle data directly in response:', response.car);
            return response.car;
          } else {
            console.log('Unexpected response format:', response);
            return response;
          }
        }),
        catchError(error => {
          console.error('Error fetching vehicle details', error);
          console.error('Error response:', error.error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          return throwError(() => new Error(error.error?.message || 'Failed to load vehicle details'));
        })
      );
  }

  addVehicle(vehicle: Omit<Car, 'id' | 'createdAt' | 'updatedAt'> & { images?: any[] }): Observable<Car> {
    console.log('Adding vehicle with data:', vehicle);
    
    const headers = this.getAuthHeaders();
    console.log('Adding vehicle with headers:', headers);
    
    const formData = new FormData();
    
    // Handle image files first and separately
    if (vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0) {
      console.log(`Adding ${vehicle.images.length} image files`);
      
      // Use type assertion to handle the files
      for (let i = 0; i < vehicle.images.length; i++) {
        formData.append('photos', vehicle.images[i]);
        console.log('Added image file to form data');
      }
      
      // Remove images from the vehicle object to prevent duplication in formData
      const { images, ...vehicleWithoutImages } = vehicle;
      vehicle = vehicleWithoutImages as any;
    } else {
      console.warn('No images provided for vehicle!');
    }
    
    // Now handle the rest of the vehicle data
    Object.entries(vehicle).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return; // Skip null or undefined values
      }
      
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
        console.log(`Appended object ${key}:`, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
        console.log(`Appended ${key}:`, value);
      }
    });
    
    console.log('FormData contents:');
    formData.forEach((value, key) => {
      if (key === 'photos') {
        console.log(`${key}: [File object]`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
    
    return this.http.post<{ status: string, data: { car: Car } }>(`${this.apiUrl}`, formData, { headers })
      .pipe(
        map(response => {
          console.log('Success response:', response);
          return response.data.car;
        }),
        catchError(error => {
          console.error('Error adding vehicle:', error);
          if (error.error) {
            console.error('Error details:', error.error);
          }
          return throwError(() => new Error(error.error?.message || 'Failed to add vehicle'));
        })
      );
  }

  updateVehicle(id: string, vehicle: Partial<Car>): Observable<Car | undefined> {
    console.log('Update Vehicle - ID:', id);
    
    if (!id || id === 'null' || id === 'undefined' || id === '') {
      console.error('Invalid vehicle ID for update');
      return throwError(() => new Error('Invalid vehicle ID'));
    }
    
    // Ensure ID is properly formatted and sanitized
    id = id.trim();
    
    console.log('Update Vehicle - API URL:', `${this.apiUrl}/${id}`);
    
    // Create FormData for multipart request (if the vehicle contains images)
    const formData = new FormData();
    let hasFiles = false;
    
    // Log all vehicle data being sent
    console.log('Vehicle data for update:');
    Object.entries(vehicle).forEach(([key, value]) => {
      console.log(`${key}:`, value);
      
      if ((key === 'photos' || key === 'images') && Array.isArray(value)) {
        hasFiles = true;
        // Use simple loop to append files to avoid type issues
        for (let i = 0; i < value.length; i++) {
          formData.append('photos', value[i]);
          console.log('Added photo file', i+1, 'to form data');
        }
      } else if (key === 'pricePerDay') {
        formData.append('pricePerDay', String(value));
      } else if (key === 'features' && Array.isArray(value)) {
        formData.append('features', JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    console.log('Has files:', hasFiles);
    
    // Use a more flexible approach to handle various API response formats
    const updateUrl = `${this.apiUrl}/${id}`;
    console.log('Sending update request to:', updateUrl);
    
    const headers = this.getAuthHeaders();
    console.log('Updating vehicle with headers:', headers);
    
    // Log what's being sent to help debugging
    console.log('Update payload (partial):', vehicle);
    if (hasFiles) {
      console.log('Includes files:', (vehicle.photos as unknown as File[]).length, 'files');
    }
    
    // If we have files, we need to use PATCH with formData
    const request = hasFiles ?
      this.http.patch<any>(updateUrl, formData, { headers }) :
      this.http.patch<any>(updateUrl, vehicle, { headers });
    
    return request.pipe(
      map(response => {
        console.log('Update response:', response);
        if (response.data && response.data.car) {
          return response.data.car;
        } else if (response.car) {
          return response.car;
        } else {
          console.log('Returning raw response as vehicle:', response);
          return response;
        }
      }),
      catchError(error => {
        console.error('Error updating vehicle', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        return throwError(() => new Error(error.error?.message || 'Failed to update vehicle'));
      })
    );
  }

  deleteVehicle(id: string): Observable<boolean> {
    if (!id || id === 'null' || id === 'undefined' || id === '') {
      console.error('Invalid vehicle ID for delete');
      return throwError(() => new Error('Invalid vehicle ID'));
    }
    
    // Ensure ID is properly formatted and sanitized
    id = id.trim();
    
    const headers = this.getAuthHeaders();
    console.log('Deleting vehicle with headers:', headers);
    console.log('Deleting vehicle with ID:', id);
    
    return this.http.delete<{ status: string }>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        map(response => response.status === 'success'),
        catchError(error => {
          console.error('Error deleting vehicle', error);
          return throwError(() => new Error(error.error?.message || 'Failed to delete vehicle'));
        })
      );
  }

  searchVehicles(query: string): Observable<Car[]> {
    const headers = this.getAuthHeaders();
    console.log('Searching vehicles with headers:', headers);
    
    return this.http.get<{ status: string, data: { cars: Car[] } }>(`${this.apiUrl}/search?q=${query}`, { headers })
      .pipe(
        map(response => response.data.cars),
        catchError(error => {
          console.error('Error searching vehicles', error);
          return throwError(() => new Error(error.error?.message || 'Failed to search vehicles'));
        })
      );
  }
}