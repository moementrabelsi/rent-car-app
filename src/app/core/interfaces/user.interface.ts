export interface User {
  // Support both id and _id (MongoDB format)
  id: string;
  _id?: string;
  
  // Support both name and first/last name
  name?: string;
  firstName?: string;
  lastName?: string;
  
  email: string;
  // Role can be 'customer' or 'admin' in frontend but 'user' or 'admin' in backend
  role?: 'customer' | 'admin' | 'user';
  phone?: string;
  address?: string;
  isEmailVerified?: boolean;
  profileImage?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface UserActivity {
  id: string;
  type: 'booking' | 'profile_update' | 'password_change';
  description: string;
  date: Date;
} 