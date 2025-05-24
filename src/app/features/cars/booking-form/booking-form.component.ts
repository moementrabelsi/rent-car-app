import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Booking } from '../../../core/interfaces/booking.interface';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  @Input() carId!: string;
  @Input() totalAmount!: number;
  @Input() dailyRate!: number;
  
  bookingForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  bookingCreated = false;
  createdBooking: Booking | null = null;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router
  ) {
    this.bookingForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      pickupLocation: ['', Validators.required],
      dropoffLocation: ['', Validators.required],
      extras: this.fb.group({
        gpsNavigation: [false],
        childSeat: [false],
        additionalDriver: [false],
        roadside: [false]
      })
    });
  }

  ngOnInit(): void {
    // Pre-populate dates with tomorrow and day after tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    this.bookingForm.patchValue({
      startDate: this.formatDate(tomorrow),
      endDate: this.formatDate(dayAfter)
    });
  }

  /**
   * Format a date to YYYY-MM-DD format
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calculate the total booking duration in days
   */
  getDurationDays(): number {
    const startDate = new Date(this.bookingForm.get('startDate')?.value);
    const endDate = new Date(this.bookingForm.get('endDate')?.value);
    
    if (!startDate || !endDate) return 0;
    
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Calculate the total booking amount
   */
  calculateTotal(): number {
    const days = this.getDurationDays();
    const baseAmount = days * this.dailyRate;
    
    let extrasCost = 0;
    const extras = this.bookingForm.get('extras')?.value;
    
    if (extras) {
      if (extras.gpsNavigation) extrasCost += 5 * days;
      if (extras.childSeat) extrasCost += 10;
      if (extras.additionalDriver) extrasCost += 20;
      if (extras.roadside) extrasCost += 15;
    }
    
    return baseAmount + extrasCost;
  }

  /**
   * Submit the booking
   */
  onSubmit(): void {
    if (this.bookingForm.invalid) {
      return;
    }
    
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.error = 'You must be logged in to make a booking';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    // Get the current user ID
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      this.error = 'User ID not found. Please log in again.';
      this.isLoading = false;
      return;
    }
    
    const bookingData = {
      vehicleId: this.carId,
      userId: userId,
      startDate: this.bookingForm.value.startDate,
      endDate: this.bookingForm.value.endDate,
      pickupLocation: this.bookingForm.value.pickupLocation,
      dropoffLocation: this.bookingForm.value.dropoffLocation,
      totalAmount: this.calculateTotal(),
      extras: this.bookingForm.value.extras,
      status: 'active' as 'pending' | 'active' | 'completed' | 'cancelled',
      paymentStatus: 'paid' as 'pending' | 'paid' | 'refunded'
    };
    
    this.bookingService.createBooking(bookingData).subscribe({
      next: (booking) => {
        console.log('Booking created:', booking);
        this.createdBooking = booking;
        this.bookingCreated = true;
        
        // Navigate to booking confirmation or bookings list
        this.router.navigate(['/bookings']);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating booking:', error);
        this.error = error.message || 'Failed to create booking';
        this.isLoading = false;
      }
    });
  }


}