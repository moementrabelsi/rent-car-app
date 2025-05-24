export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'insurance' | 'gps' | 'childSeat' | 'additionalDriver' | 'other';
}