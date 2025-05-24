import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Booking } from '../interfaces/booking.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    console.log('Fetching all bookings from API...');
    console.log('API URL:', `${this.apiUrl}`);
    
    // Add detailed logging of headers being sent
    const token = localStorage.getItem('auth_token');
    console.log('Auth token available:', !!token);
    
    return this.http.get<any>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          console.log('Bookings API response:', response);
          let bookings: Booking[] = [];
          
          // Handle different response formats
          if (response.data && response.data.bookings) {
            console.log('Format: response.data.bookings');
            bookings = response.data.bookings;
          } else if (response.bookings) {
            console.log('Format: response.bookings');
            bookings = response.bookings;
          } else if (Array.isArray(response)) {
            console.log('Format: array');
            bookings = response;
          } else {
            console.error('Unexpected response format:', response);
            return [];
          }
          
          // Process bookings to ensure id property is set from _id
          console.log('Raw bookings data before processing:', JSON.stringify(bookings));
          return bookings.map(booking => {
            if (booking._id && !booking.id) {
              booking.id = booking._id;
            }
            
            // Default vehicle object in case it's missing
            if (!booking.vehicle) {
              booking.vehicle = {
                id: '',
                name: 'Vehicle information unavailable',
                brand: '',
                model: '',
                imageUrl: 'assets/images/default-car.jpg',
                type: 'Unknown'
              };
            }
            
            // If vehicleId is an object (populated), extract vehicle details
            if (booking.vehicleId && typeof booking.vehicleId === 'object') {
              const vehicleData = booking.vehicleId as any;
              console.log('Vehicle data for booking:', vehicleData);
              booking.vehicle = {
                id: vehicleData._id || '',
                name: vehicleData.name || vehicleData.brand + ' ' + vehicleData.model || 'Unknown Vehicle',
                brand: vehicleData.brand || '',
                model: vehicleData.model || '',
                imageUrl: vehicleData.imageUrl || 'assets/images/default-car.jpg',
                type: vehicleData.transmission || 'Standard'
              };
            }
            
            return booking;
          });
        }),
        catchError(error => {
          console.error('Error fetching bookings', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load bookings'));
        })
      );
  }

  getBookingById(id: string): Observable<Booking | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          // Handle different response formats
          if (response.data && response.data.booking) {
            return response.data.booking;
          } else if (response.booking) {
            return response.booking;
          } else {
            console.error('Unexpected response format:', response);
            return undefined;
          }
        }),
        catchError(error => {
          console.error('Error fetching booking details', error);
          return throwError(() => new Error(error.error?.message || 'Failed to load booking details'));
        })
      );
  }

  createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Observable<Booking> {
    return this.http.post<any>(`${this.apiUrl}`, booking)
      .pipe(
        map(response => {
          // Handle different response formats
          if (response.data && response.data.booking) {
            return response.data.booking;
          } else if (response.booking) {
            return response.booking;
          } else {
            console.error('Unexpected response format:', response);
            throw new Error('Received unexpected response format from server');
          }
        }),
        catchError(error => {
          console.error('Error creating booking', error);
          return throwError(() => new Error(error.error?.message || 'Failed to create booking'));
        })
      );
  }

  updateBooking(id: string, booking: Partial<Booking>): Observable<Booking | undefined> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, booking)
      .pipe(
        map(response => {
          // Handle different response formats
          if (response.data && response.data.booking) {
            return response.data.booking;
          } else if (response.booking) {
            return response.booking;
          } else {
            console.error('Unexpected response format:', response);
            return undefined;
          }
        }),
        catchError(error => {
          console.error('Error updating booking', error);
          return throwError(() => new Error(error.error?.message || 'Failed to update booking'));
        })
      );
  }

  cancelBooking(id: string): Observable<boolean> {
    console.log('Booking service - cancel booking ID:', id);
    if (!id) {
      console.error('Invalid booking ID provided for cancellation');
      return throwError(() => new Error('Invalid booking ID'));
    }
    
    // Ensure id is a string and properly formatted for MongoDB
    const bookingId = id.toString();
    console.log('Sending cancel request to:', `${this.apiUrl}/${bookingId}/cancel`);
    
    return this.http.put<any>(`${this.apiUrl}/${bookingId}/cancel`, {})
      .pipe(
        map(response => {
          console.log('Cancel booking response:', response);
          if (typeof response === 'object') {
            return response.status === 'success' || (response.data && response.data.success);
          }
          return false;
        }),
        catchError(error => {
          console.error('Error canceling booking', error);
          return throwError(() => new Error(error.error?.message || 'Failed to cancel booking'));
        })
      );
  }

  approveBooking(id: string): Observable<Booking | undefined> {
    return this.http.put<any>(`${this.apiUrl}/${id}/approve`, {})
      .pipe(
        map(response => {
          // Handle different response formats
          if (response.data && response.data.booking) {
            return response.data.booking;
          } else if (response.booking) {
            return response.booking;
          } else {
            console.error('Unexpected response format:', response);
            return undefined;
          }
        }),
        catchError(error => {
          console.error('Error approving booking', error);
          return throwError(() => new Error(error.error?.message || 'Failed to approve booking'));
        })
      );
  }

  rejectBooking(id: string): Observable<Booking | undefined> {
    return this.http.put<any>(`${this.apiUrl}/${id}/reject`, {})
      .pipe(
        map(response => {
          // Handle different response formats
          if (response.data && response.data.booking) {
            return response.data.booking;
          } else if (response.booking) {
            return response.booking;
          } else {
            console.error('Unexpected response format:', response);
            return undefined;
          }
        }),
        catchError(error => {
          console.error('Error rejecting booking', error);
          return throwError(() => new Error(error.error?.message || 'Failed to reject booking'));
        })
      );
  }

  deleteBooking(id: string): Observable<boolean> {
    // Ensure we're using a valid MongoDB ObjectId string
    console.log('Sending delete request for booking ID:', id);
    
    // Log authentication details for debugging
    const token = localStorage.getItem('auth_token');
    console.log('Auth token available for delete request:', !!token);
    
    // Add detailed console logs for the request
    console.log(`Deleting booking at: ${this.apiUrl}/${id}`);
    
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          console.log('Delete booking response:', response);
          // Handle different response formats
          if (response.status === 'success') {
            return true;
          } else if (response.success === true) {
            return true;
          } else {
            // If no explicit status, assume success because server returned 200 OK
            return true;
          }
        }),
        catchError(error => {
          console.error('Error deleting booking', error);
          console.error('Error response details:', error.error);
          // Extract error message from different possible formats
          const errorMessage = 
            error.error?.message || 
            (typeof error.error === 'string' ? error.error : null) || 
            error.message || 
            'Failed to delete booking';
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }



  // Emergency delete method to bypass authorization checks
  emergencyDeleteBooking(id: string): Observable<boolean> {
    console.log('Using emergency delete for booking ID:', id);
    
    return this.http.delete<any>(`${this.apiUrl}/emergency/${id}`)
      .pipe(
        map(response => {
          console.log('Emergency delete response:', response);
          return true; // Always return true if we get any response
        }),
        catchError(error => {
          console.error('Error in emergency delete', error);
          return throwError(() => new Error('Emergency delete failed: ' + error.message));
        })
      );
  }

  getUserBookings(userId: string): Observable<Booking[]> {
    // Ensure userId is using the MongoDB _id format if available
    // This is critical for backend compatibility
    console.log('Original User ID format:', userId);
    
    // Log token for debugging authentication issues
    const token = localStorage.getItem('auth_token');
    console.log('Auth token available:', !!token);
    console.log('Auth token first 20 chars:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Get current user from localStorage to check if we need to use _id
    try {
      const currentUserStr = localStorage.getItem('current_user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser._id && userId === currentUser.id) {
          // If the frontend is using 'id' but the backend needs '_id'
          console.log('Switching to MongoDB _id format:', currentUser._id);
          userId = currentUser._id;
        }
      }
    } catch (error) {
      console.error('Error accessing user data from localStorage:', error);
    }
    
    console.log('Final User ID for API request:', userId);
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map(response => {
          console.log('User bookings response:', response);
          // Handle different response formats
          let bookings: Booking[] = [];
          
          if (response.data && response.data.bookings) {
            console.log('Using response.data.bookings format');
            bookings = response.data.bookings;
          } else if (response.bookings) {
            console.log('Using response.bookings format');
            bookings = response.bookings;
          } else if (Array.isArray(response)) {
            console.log('Using array response format');
            bookings = response;
          } else {
            console.error('Unexpected response format:', response);
            return [];
          }
          
          console.log(`Found ${bookings.length} bookings for user`);
          
          // Process the bookings to correctly handle the vehicle data and MongoDB _id
          return bookings.map(booking => {
            // Create a copy to avoid direct mutation
            const processedBooking = { ...booking };
            
            // Preserve the MongoDB _id for backend operations
            if (processedBooking._id) {
              // Ensure _id is a string
              if (typeof processedBooking._id === 'object' && (processedBooking._id as any).$oid) {
                processedBooking._id = (processedBooking._id as any).$oid;
              } else {
                processedBooking._id = processedBooking._id.toString();
              }
              
              // Also set the frontend id if not present
              if (!processedBooking.id) {
                // Force string type to fix type error
                processedBooking.id = processedBooking._id || '';
              }
            }
            
            // If vehicleId is populated with a Car document, map it to the vehicle property
            if (processedBooking.vehicleId && typeof processedBooking.vehicleId === 'object') {
              const vehicleData = processedBooking.vehicleId as Record<string, any>;
              processedBooking.vehicle = {
                id: vehicleData['_id']?.toString() || vehicleData['id']?.toString() || '',
                name: (vehicleData['brand'] && vehicleData['model']) 
                      ? `${vehicleData['brand']} ${vehicleData['model']}` 
                      : vehicleData['name'] || 'Unknown Vehicle',
                brand: vehicleData['brand'] || '',
                model: vehicleData['model'] || '',
                imageUrl: vehicleData['imageUrl'] || 'assets/images/default-car.jpg',
                type: (vehicleData['transmission'] || vehicleData['type'] || 'Standard')
              };
            }
            
            console.log('Processed booking ID:', processedBooking.id || processedBooking._id);
            return processedBooking;
          });
        }),
        catchError(error => {
          console.error('Error fetching user bookings', error);
          console.error('Error details:', error.error);
          return throwError(() => new Error(error.error?.message || 'Failed to load user bookings'));
        })
      );
  }
}