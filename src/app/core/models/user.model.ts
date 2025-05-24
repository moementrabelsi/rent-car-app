export interface User {
  id: string;
  // Include MongoDB _id for backend compatibility
  _id?: string;
  email: string;
  password?: string; // Only used during registration/login
  firstName: string;
  lastName: string;
  // For backend compatibility
  name?: string; 
  role: 'admin' | 'customer';
  phone?: string;
  licenseNumber?: string;
  profileImage?: string; // User profile image URL
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}