import { Car } from './car.model';
import { User } from './user.model';
import { AdditionalService } from './service.model';

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  carId: string;
  car?: Car;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  dropoffLocation: string;
  totalPrice: number;
  status: BookingStatus;
  additionalServices: AdditionalService[];
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';