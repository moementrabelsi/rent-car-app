import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/interfaces/booking.interface';
import { Router } from '@angular/router';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  // Icons
  faCalendarAlt = faCalendarAlt;
  
  // Booking data
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  
  // Filter options
  selectedStatus: string = 'all';
  selectedDateRange: string = 'all';
  
  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    console.log('Loading user bookings...');
    this.bookingService.getBookings().subscribe(
      (bookings) => {
        console.log('User bookings loaded:', bookings);
        this.bookings = bookings;
        this.filterBookings(); // Apply filters initially
      },
      (error) => {
        console.error('Error loading bookings:', error);
      }
    );
  }
  
  filterBookings(): void {
    // Start with all bookings
    let filtered = [...this.bookings];
    
    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === this.selectedStatus);
    }
    
    // Apply date range filter
    const today = new Date();
    if (this.selectedDateRange === 'upcoming') {
      filtered = filtered.filter(booking => {
        const startDate = new Date(booking.startDate);
        return startDate >= today;
      });
    } else if (this.selectedDateRange === 'past') {
      filtered = filtered.filter(booking => {
        const endDate = new Date(booking.endDate);
        return endDate < today;
      });
    }
    
    this.filteredBookings = filtered;
    console.log('Filtered bookings:', this.filteredBookings);
  }
  
  viewDetails(booking: Booking): void {
    // Navigate to booking details page
    this.router.navigate(['/bookings', booking.id]);
  }
  
  cancelBooking(booking: Booking): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      // Implement actual cancellation logic here
      console.log('Booking cancelled:', booking);
      // Refresh the bookings list
      this.loadBookings();
    }
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