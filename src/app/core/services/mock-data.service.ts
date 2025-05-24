import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Vehicle } from '../interfaces/vehicle.interface';
import { Booking } from '../interfaces/booking.interface';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockVehicles: Vehicle[] = [
    {
      id: '1',
      name: 'Toyota Camry',
      brand: 'Toyota',
      model: 'Camry',
      year: 2022,
      type: 'sedan',
      transmission: 'automatic',
      fuelType: 'petrol',
      seats: 5,
      pricePerDay: 50,
      available: true,
      imageUrl: 'assets/images/vehicles/camry.jpg',
      features: ['Bluetooth', 'Backup Camera', 'Cruise Control'],
      description: 'Comfortable and reliable sedan perfect for family trips.',
      location: 'New York',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Honda CR-V',
      brand: 'Honda',
      model: 'CR-V',
      year: 2023,
      type: 'suv',
      transmission: 'automatic',
      fuelType: 'hybrid',
      seats: 5,
      pricePerDay: 65,
      available: true,
      imageUrl: 'assets/images/vehicles/crv.jpg',
      features: ['Apple CarPlay', 'Android Auto', 'Lane Departure Warning'],
      description: 'Spacious SUV with excellent fuel efficiency.',
      location: 'Los Angeles',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private mockBookings: Booking[] = [
    {
      id: '1',
      userId: '1',
      vehicleId: '1',
      vehicle: {
        id: '1',
        name: 'Toyota Camry',
        brand: 'Toyota',
        model: 'Camry',
        imageUrl: 'assets/images/vehicles/camry.jpg'
      },
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-05'),
      totalAmount: 200,
      status: 'active',
      paymentStatus: 'paid',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, New York',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getVehicles(): Observable<Vehicle[]> {
    return of(this.mockVehicles);
  }

  getVehicleById(id: string): Observable<Vehicle | undefined> {
    return of(this.mockVehicles.find(v => v.id === id));
  }

  getBookings(): Observable<Booking[]> {
    return of(this.mockBookings);
  }

  getBookingById(id: string): Observable<Booking | undefined> {
    return of(this.mockBookings.find(b => b.id === id));
  }

  getUserById(id: string): Observable<User | undefined> {
    return of(this.mockUsers.find(u => u.id === id));
  }
} 