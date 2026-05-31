export type UserRole = "CUSTOMER" | "ADMIN" | "MANAGER" | "DRIVER" | "FINANCE";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  category: string;
  district: string;
  latitude: number;
  longitude: number;
  imageUrls: string[];
  entryFee?: number;
  rating?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerDay: number;
  imageUrl?: string;
}

export interface TripDay {
  dayNumber: number;
  placeIds: string[];
  notes?: string;
}

export interface TripPlan {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
  vehicleId?: string;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "IN_PROGRESS";

export interface Booking {
  id: string;
  userId: string;
  tripPlan: TripPlan;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}
