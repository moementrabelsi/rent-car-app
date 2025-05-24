export interface Vehicle {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  year?: number;
  type: 'sedan' | 'suv' | 'sports' | 'luxury';
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  pricePerDay: number;
  imageUrl: string;
  location: string;
  description?: string;
  available?: boolean;
  stock?: number;
  features?: string[];
  photos?: string[];
  images?: string[];
  carDirName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}