export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string; // User profile image URL
  carId: string;
  rating: number;
  comment: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
