export type UserRole =
  | "CUSTOMER"
  | "ADMIN"
  | "MANAGER"
  | "FINANCE_MANAGER"
  | "DRIVER";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  profileImageUrl?: string | null;
  preferredCurrency?: string | null;
  isActive?: boolean;
  licenseNumber?: string | null;
  assignedVehicleId?: string | null;
  isAvailable?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export type PlaceCategory =
  | "DESTINATION"
  | "ACCOMMODATION"
  | "RESTAURANT"
  | "ACTIVITY";

export type PriceRange = "BUDGET" | "MID_RANGE" | "LUXURY";

export interface Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategory;
  district: string;
  province?: string;
  latitude: number;
  longitude: number;
  imageUrls: string[];
  thumbnailUrl?: string;
  priceRange?: PriceRange;
  rating?: number;
  tags?: string[];
  highlights?: string[];
  bestTimeToVisit?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export type VehicleType =
  | "SEDAN"
  | "SUV"
  | "VAN"
  | "MINIBUS"
  | "LUXURY_SUV";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  capacity: number;
  description?: string;
  imageUrl?: string;
  registrationNumber?: string;
  isActive?: boolean;
  assignedDriverId?: string | null;
}

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface CreateBookingPayload {
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  selectedPlaceIds: string[];
  fromDistrict: string;
  toDistrict: string;
  pickupLocation: string;
  dropLocation: string;
  pickupTime: string;
  startDate: string;
  endDate: string;
  passengerCount: number;
  vehicleType: VehicleType;
  preferredCurrency: string;
  customerNotes?: string;
}

export interface BookingCreateResponse {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  status: BookingStatus;
  totalPriceLKR: number;
  totalPriceForeign: number;
  preferredCurrency: string;
  pdfUrl?: string | null;
}

export interface AdminBooking extends CustomerBooking {
  reviewedByUserId?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
}

/** Driver trip view — customer contact is platform-mediated only */
export type DriverTripBooking = Omit<
  AdminBooking,
  "customerEmail" | "customerWhatsapp"
> & {
  conversationId?: string | null;
};

export type TripConversationStatus = "ACTIVE" | "CLOSED";

export type TripCallStatus =
  | "RINGING"
  | "ACTIVE"
  | "ENDED"
  | "MISSED"
  | "DECLINED";

export interface TripConversation {
  id: string;
  bookingId: string;
  bookingNumber: string;
  customerId?: string | null;
  customerName: string;
  driverId: string;
  driverName: string;
  status: TripConversationStatus;
  lastMessageAt?: string | null;
  createdAt?: string;
  unreadCount: number;
}

export interface TripMessage {
  id: string;
  conversationId: string;
  bookingId: string;
  senderId: string;
  senderRole: UserRole;
  senderDisplayName: string;
  body: string;
  type: "TEXT" | "SYSTEM";
  createdAt: string;
}

export interface TripCallSession {
  id: string;
  conversationId: string;
  bookingId: string;
  initiatorId: string;
  initiatorRole: UserRole;
  status: TripCallStatus;
  answeredAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  createdAt: string;
}

export interface CallSignal {
  id: string;
  callSessionId: string;
  fromUserId: string;
  signalType: string;
  payload: string;
  createdAt: string;
}

export interface AdminDashboardStats {
  pendingBookings: number;
  todaysBookings: number;
  thisMonthRevenueLKR: number;
  activeDrivers: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  pendingQueue: AdminBooking[];
  recentActivity: AdminBooking[];
}

export interface ManagerDashboardStats {
  pendingBookings: number;
  approvedToday: number;
  rejectedThisWeek: number;
  totalReviewed: number;
}

export interface ManagerDashboardData {
  stats: ManagerDashboardStats;
  pendingQueue: AdminBooking[];
}

export interface RevenueSummary {
  totalRevenueLKR: number;
  totalBookings: number;
  avgBookingValueLKR: number;
  revenueByMonth: { month: string; revenue: number }[];
  revenueByVehicleType: { type: string; revenue: number; count: number }[];
  topRoutes: { from: string; to: string; count: number; revenue: number }[];
}

export interface PricingRule {
  id: string;
  vehicleType: VehicleType;
  basePricePerDayLKR: number;
  pricePerExtraPassengerLKR: number;
  zoneMultipliers: { fromDistrict: string; toDistrict: string; multiplier: number }[];
  seasonalMultiplier: number;
  isActive: boolean;
  lastUpdatedByUserId?: string;
  updatedAt?: string;
}

export interface ExchangeRates {
  id: string;
  baseCurrency: string;
  rates: Record<string, number>;
  lastUpdated?: string;
  updatedByUserId?: string;
}

export interface FinanceBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  fromDistrict: string;
  toDistrict: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  passengerCount: number;
  vehicleType: VehicleType;
  status: BookingStatus;
  totalPriceLKR: number;
  totalPriceForeign: number;
  preferredCurrency: string;
  exchangeRateUsed?: number;
  createdAt?: string;
}

export interface DriverAvailability {
  driverId: string;
  blockedDates: string[];
}

export interface AdminCreateUserPayload {
  fullName: string;
  email: string;
  temporaryPassword: string;
  phone: string;
  role: UserRole;
  licenseNumber?: string;
}

export interface CustomerBooking {
  id: string;
  bookingNumber: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  selectedPlaceIds: string[];
  selectedPlaceNames: string[];
  fromDistrict: string;
  toDistrict: string;
  pickupLocation: string;
  dropLocation: string;
  pickupTime?: string | null;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  passengerCount: number;
  vehicleType: VehicleType;
  vehicleId?: string | null;
  vehicleName?: string | null;
  assignedDriverId?: string | null;
  assignedDriverName?: string | null;
  assignedDriverPhone?: string | null;
  status: BookingStatus;
  rejectionReason?: string | null;
  totalPriceLKR: number;
  totalPriceForeign: number;
  preferredCurrency: string;
  exchangeRateUsed?: number;
  pdfUrl?: string | null;
  customerNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
  preferredCurrency: string;
  isAvailable?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PublicBookingTrack {
  bookingNumber: string;
  status: BookingStatus;
  customerName: string;
  customerEmail?: string;
  customerWhatsapp?: string;
  selectedPlaceNames?: string[];
  fromDistrict: string;
  toDistrict: string;
  pickupTime?: string | null;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  passengerCount: number;
  vehicleType: VehicleType;
  assignedDriverName?: string | null;
  vehicleName?: string | null;
  totalPriceLKR?: number;
  totalPriceForeign?: number;
  preferredCurrency?: string;
  pdfUrl?: string | null;
  rejectionReason?: string | null;
}

/** @deprecated use BookingCreateResponse or PublicBookingTrack */
export interface Booking {
  id: string;
  userId: string;
  tripPlan: TripPlan;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}

export interface TripPlan {
  id?: string;
  title: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
  vehicleId?: string;
}

export interface TripDay {
  fromDistrict: string;
  toDistrict: string;
  multiplier: number;
}

export interface ZoneMultiplier {
  fromDistrict: string;
  toDistrict: string;
  multiplier: number;
}

export interface PricingRule {
  id: string;
  vehicleType: VehicleType;
  basePricePerDayLKR: number;
  pricePerExtraPassengerLKR: number;
  zoneMultipliers: ZoneMultiplier[];
  seasonalMultiplier: number;
  isActive: boolean;
  lastUpdatedByUserId?: string;
  updatedAt?: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  rates: Record<string, number>;
  lastUpdated?: string;
  updatedByUserId?: string;
}

export interface PriceQuoteBreakdown {
  baseCost: number;
  passengerExtra: number;
  zoneMultiplier: number;
  seasonalMultiplier: number;
}

export interface PriceQuote {
  vehicleType: VehicleType;
  fromDistrict: string;
  toDistrict: string;
  numberOfDays: number;
  passengers: number;
  totalLKR: number;
  totalForeignCurrency: number;
  preferredCurrency: string;
  exchangeRateUsed: number;
  breakdown: PriceQuoteBreakdown;
}

export interface TripConfig {
  fromDistrict: string;
  toDistrict: string;
  pickupLocation: string;
  dropLocation: string;
  pickupTime: string;
  passengerCount: number;
  vehicleType: VehicleType;
  preferredCurrency: string;
  startDate: string;
  endDate: string;
  customerNotes?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PlaceFilters {
  category?: PlaceCategory | "";
  district?: string;
  priceRange?: PriceRange | "";
  tags?: string;
  search?: string;
  page?: number;
  size?: number;
}

export type AvailabilityStatus = "AVAILABLE" | "LIMITED" | "UNAVAILABLE" | "PAST";

export interface DayAvailability {
  availableDrivers: number;
  availableVehicles: number;
  isAvailable: boolean;
}

export type AvailabilityCalendarMap = Record<string, DayAvailability>;

export interface RangeAvailability {
  available: boolean;
  minAvailableDrivers: number;
  minAvailableVehicles: number;
  blockedDays: string[];
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

/** @deprecated use DayAvailability + AvailabilityCalendarMap */
export interface AvailabilityDay {
  date: string;
  status: AvailabilityStatus;
  availableDrivers: number;
}

/** @deprecated use AvailabilityCalendarMap */
export interface AvailabilityCalendar {
  year: number;
  month: number;
  days: AvailabilityDay[];
}
