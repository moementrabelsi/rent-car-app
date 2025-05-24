export interface Car {
  id: string;
  _id?: string; // MongoDB ID
  make: string;
  model: string;
  year: number;
  description: string;
  pricePerDay: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'automatic' | 'manual';
  seats: number;
  doors: number;
  mileage: number;
  status: 'available' | 'booked' | 'maintenance';
  category: string;
  photos?: string[];
  images?: string[];
  features?: string[];
  location?: string;
  availability?: any;
  rating?: number;
  numberOfReviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Additional properties for car details display
  vin?: string;
  stockNumber?: string;
  interiorColor?: string;
  exteriorColor?: string;
  condition?: string;
  engine?: string;
  driveTrain?: string;
}
