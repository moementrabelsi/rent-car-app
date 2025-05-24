export interface Car {
  id: string;
  _id?: string; // MongoDB ID
  // Fields from the database screenshot
  name?: string;  // Combined name like "Fiat punto 1985"
  brand?: string; // Brand name like "Fiat"
  make: string;   // Keep for backward compatibility
  model: string;
  year: number;
  category: CarCategory;
  pricePerDay: number;
  availability: {
    from: Date;
    to: Date;
  };
  images: string[];
  photos?: string[];  // Add photos property to match template
  description: string;
  features: string[];
  location: string;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  doors: number;
  mileage: number;  // Add mileage property
  status: 'available' | 'booked' | 'maintenance';
  rating?: number;
  numberOfReviews?: number;
  reviewCount?: number;  // Add reviewCount property to handle backend data format
  stock?: number;  // Number of vehicles of this model available
  carDirName?: string; // Directory name for car photos
  createdAt: Date;
  updatedAt: Date;
}

export type CarCategory = 'economy' | 'compact' | 'midsize' | 'suv' | 'luxury' | 'van' | 'sports';