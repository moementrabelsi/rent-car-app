import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { BookingService } from '../../../core/services/booking.service';
import { Vehicle } from '../../../core/interfaces/vehicle.interface';
import { Booking } from '../../../core/interfaces/booking.interface';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  vehicle: Vehicle | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private bookingService: BookingService
  ) {
    this.bookingForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.vehicleService.getVehicleById(vehicleId).subscribe(
        (vehicle: Vehicle | undefined) => {
          if (vehicle) {
            this.vehicle = vehicle;
          }
        },
        (error: Error) => {
          console.error('Error loading vehicle:', error);
          this.error = 'Failed to load vehicle details';
        }
      );
    }
  }

  onSubmit(): void {
    if (this.bookingForm.valid && this.vehicle) {
      this.isLoading = true;
      this.error = null;

      const booking: Partial<Booking> = {
        vehicleId: this.vehicle.id,
        startDate: this.bookingForm.value.startDate,
        endDate: this.bookingForm.value.endDate,
        status: 'pending',
        paymentStatus: 'pending'
      };

      // For now, just log the booking
      console.log('Booking details:', booking);
      this.isLoading = false;
    }
  }
} 