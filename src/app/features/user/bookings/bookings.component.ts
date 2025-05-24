import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Booking } from '../../../core/interfaces/booking.interface';
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faMoneyBillWave, 
  faClipboardList,
  faSpinner,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, CurrencyPipe]
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;
  error: string | null = null;
  processingBookings: Set<string> = new Set<string>();
  
  // Icons
  faCalendarAlt = faCalendarAlt;
  faMapMarkerAlt = faMapMarkerAlt;
  faMoneyBillWave = faMoneyBillWave;
  faClipboardList = faClipboardList;
  faSpinner = faSpinner;
  faInfoCircle = faInfoCircle;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.error = null;

    // Get the current user from the auth service
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser || !currentUser.id) {
      this.error = 'You must be logged in to view your bookings';
      this.isLoading = false;
      return;
    }

    // Ensure we're using the correct format of user ID
    // Using type assertion to handle potential _id property
    const userId = (currentUser as any)._id || currentUser.id;
    
    console.log('Loading bookings for user:', userId);
    console.log('Current user details:', JSON.stringify(currentUser));
    
    // Use the getUserBookings method with the current user's ID
    this.bookingService.getUserBookings(userId).subscribe({
      next: (bookings: Booking[]) => {
        console.log('Received bookings:', bookings);
        this.bookings = bookings;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.error = 'Failed to load bookings: ' + (error.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  isProcessingBooking(bookingId: string): boolean {
    return this.processingBookings.has(bookingId);
  }

  // Emergency method to delete a specific booking using direct ID
  emergencyDeleteBooking(booking: Booking): void {
    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      const bookingId = booking.id || (booking as any)._id;
      console.log('Emergency deleting booking with ID:', bookingId);
      
      // Show spinner
      this.processingBookings.add(bookingId);
      
      // Call the emergency delete method
      this.bookingService.emergencyDeleteBooking(bookingId).subscribe({
        next: () => {
          console.log('Emergency deletion successful');
          // Remove booking from UI
          this.bookings = this.bookings.filter(b => b.id !== booking.id);
          alert('Booking has been canceled successfully.');
          this.processingBookings.delete(bookingId);
        },
        error: (error) => {
          console.error('Emergency deletion failed:', error);
          alert('Emergency deletion failed: ' + error.message);
          this.processingBookings.delete(bookingId);
        }
      });
    }
  }
  
  deleteBooking(booking: Booking): void {
    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      // Extract the MongoDB _id directly from the displayed ID in the UI
      // Based on your database screenshot, we need to use the exact ObjectId format
      
      // Use the ID from the UI which is the MongoDB ObjectId
      const bookingIdFromUI = booking.id;
      
      // Directly use the booking ID from the front-end as is - it should match exactly what's in MongoDB
      console.log('Booking ID from UI:', bookingIdFromUI);
      console.log('Full booking object:', booking);
      
      let mongoId = bookingIdFromUI;
      
      // For extra safety, log all possible ID formats
      if (booking._id) {
        console.log('booking._id available:', booking._id);
      }
      
      // Display the ID we're going to use for deletion
      console.log('Using ID for deletion:', mongoId);
      
      // Detailed logging for debugging
      console.log('Full booking JSON:', JSON.stringify(booking));
      
      // Make sure we have a valid ID
      if (!mongoId) {
        alert('Error: Unable to find a valid booking ID for deletion');
        return;
      }
      
      // Add booking to processing state - use consistent ID for tracking
      const trackingId = booking.id || mongoId;
      this.processingBookings.add(trackingId);
      
      // Use the MongoDB _id for backend operations
      this.bookingService.deleteBooking(mongoId).subscribe({
        next: (success) => {
          if (success) {
            // Remove the booking from the local array using a consistent identifier
            // First try to filter by id, then by _id if needed
            this.bookings = this.bookings.filter(b => {
              // Check both id and _id to ensure we find the right booking
              return b.id !== booking.id && b._id !== booking._id;
            });
            alert('Booking deleted successfully.');
          } else {
            alert('Unable to delete booking. Please try again.');
          }
          // Clean up processing state using the tracking ID we set earlier
          const trackingId = booking.id || mongoId;
          this.processingBookings.delete(trackingId);
        },
        error: (error) => {
          console.error('Error deleting booking:', error);
          console.error('Full error object:', error);
          alert('Failed to delete booking: ' + (error.error?.message || error.message || 'Unknown error'));
          // Clean up processing state using the tracking ID
          const trackingId = booking.id || mongoId;
          this.processingBookings.delete(trackingId);
        }
      });
    }
  }

  viewDetails(id: string) {
    this.router.navigate(['/bookings', id]);
  }

  getDurationDays(startDate: Date | string, endDate: Date | string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate the time difference in milliseconds
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    
    // Convert to days and round
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
} 