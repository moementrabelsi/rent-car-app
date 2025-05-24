export interface LocationInfo {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Booking {
  id: string;
  _id?: string; // MongoDB ObjectId
  userId: string;
  vehicleId: string;
  vehicle?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    imageUrl: string;
    type?: string;
  };
  startDate: Date;
  endDate: Date;
  pickupLocation: LocationInfo;
  dropoffLocation: LocationInfo;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  dropoffCoordinates?: {
    lat: number;
    lng: number;
  };
  extras?: {
    driver?: boolean;
    gps?: boolean;
    airConditioning?: boolean;
    bluetooth?: boolean;
    babySeat?: boolean;
  };
  totalAmount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingSummary {
  duration: number;
  dailyRate: number;
  subtotal: number;
  taxes: number;
  total: number;
} 