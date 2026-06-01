import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  AdminBooking,
  AdminCreateUserPayload,
  AdminDashboardData,
  ManagerDashboardData,
  RevenueSummary,
  PricingRule,
  ExchangeRates,
  FinanceBooking,
  AuthResponse,
  AvailabilityCalendarMap,
  BookingCreateResponse,
  ChangePasswordPayload,
  CreateBookingPayload,
  CurrencyInfo,
  CustomerBooking,
  DriverAvailability,
  LoginRequest,
  PageResponse,
  Place,
  PlaceFilters,
  PriceQuote,
  PublicBookingTrack,
  RangeAvailability,
  RegisterRequest,
  TokenRefreshResponse,
  UpdateProfilePayload,
  User,
  Vehicle,
  VehicleType,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

type TokenGetter = () => string | null;
type RefreshFn = () => Promise<void>;
type LogoutFn = () => Promise<void>;

let getAccessToken: TokenGetter = () => null;
let refreshAccessTokenFn: RefreshFn = async () => {};
let logoutFn: LogoutFn = async () => {};

export function configureApiAuth(config: {
  getAccessToken: TokenGetter;
  refreshAccessToken: RefreshFn;
  logout: LogoutFn;
}) {
  getAccessToken = config.getAccessToken;
  refreshAccessTokenFn = config.refreshAccessToken;
  logoutFn = config.logout;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        await refreshAccessTokenFn();
        const token = getAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch {
        await logoutFn();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data),
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),
  refresh: (refreshToken: string) =>
    api.post<TokenRefreshResponse>("/auth/refresh", { refreshToken }),
  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }),
  me: () => api.get<User>("/auth/me"),
  changePassword: (data: ChangePasswordPayload) =>
    api.post<{ message: string }>("/auth/change-password", data),
};

export const usersApi = {
  updateProfile: (data: UpdateProfilePayload) =>
    api.put<User>("/users/profile", data),
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<User>("/users/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const placesApi = {
  list: (params?: PlaceFilters) =>
    api.get<PageResponse<Place>>("/places", { params }),
  getById: (id: string) => api.get<Place>(`/places/${id}`),
  featured: () => api.get<Place[]>("/places/featured"),
  districts: () => api.get<string[]>("/places/districts"),
};

export const vehiclesApi = {
  list: (capacity = 1) =>
    api.get<Vehicle[]>("/vehicles", { params: { capacity } }),
};

export const availabilityApi = {
  calendar: (year: number, month: number) =>
    api.get<AvailabilityCalendarMap>("/availability/calendar", {
      params: { year, month },
    }),
  check: (from: string, to: string) =>
    api.get<RangeAvailability>("/availability/check", {
      params: { from, to },
    }),
  drivers: (from: string, to: string) =>
    api.get<
      {
        driverId: string;
        driverName: string;
        vehicleType: VehicleType;
        vehicleName: string;
      }[]
    >("/availability/drivers", { params: { from, to } }),
  vehicles: (from: string, to: string, minCapacity: number) =>
    api.get<Vehicle[]>("/availability/vehicles", {
      params: { from, to, minCapacity },
    }),
};

export const pricingApi = {
  quote: (params: Record<string, string | number>) =>
    api.get<PriceQuote>("/pricing/quote", { params }),
  currencies: () => api.get<CurrencyInfo[]>("/pricing/currencies"),
};

export const bookingApi = {
  create: (data: CreateBookingPayload) =>
    api.post<BookingCreateResponse>("/bookings", data),
  trackByNumber: (bookingNumber: string) =>
    api.get<PublicBookingTrack>(`/bookings/number/${encodeURIComponent(bookingNumber)}`),
  my: (params?: { status?: string; page?: number; size?: number }) =>
    api.get<PageResponse<CustomerBooking>>("/bookings/my", { params }),
  cancel: (id: string) => api.put<CustomerBooking>(`/bookings/${id}/cancel`),
};

export const adminApi = {
  getDashboard: () => api.get<AdminDashboardData>("/admin/dashboard"),
  listBookings: (params?: {
    status?: string;
    search?: string;
    reviewedBy?: string;
    page?: number;
    size?: number;
  }) => api.get<PageResponse<AdminBooking>>("/admin/bookings", { params }),
  getBooking: (id: string) => api.get<AdminBooking>(`/admin/bookings/${id}`),
  approveBooking: (
    id: string,
    data: { vehicleId: string; driverId: string }
  ) => api.put<AdminBooking>(`/admin/bookings/${id}/approve`, data),
  rejectBooking: (id: string, data: { rejectionReason: string }) =>
    api.put<AdminBooking>(`/admin/bookings/${id}/reject`, data),
  completeBooking: (id: string) =>
    api.put<AdminBooking>(`/admin/bookings/${id}/complete`),
  listPlaces: () => api.get<Place[]>("/admin/places"),
  createPlace: (data: unknown) => api.post<Place>("/admin/places", data),
  updatePlace: (id: string, data: unknown) =>
    api.put<Place>(`/admin/places/${id}`, data),
  togglePlaceActive: (id: string) =>
    api.put<Place>(`/admin/places/${id}/active`),
  togglePlaceFeature: (id: string) =>
    api.put<Place>(`/admin/places/${id}/feature`),
  uploadPlaceImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Place>(`/admin/places/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  listVehicles: () => api.get<Vehicle[]>("/admin/vehicles"),
  createVehicle: (data: unknown) => api.post<Vehicle>("/admin/vehicles", data),
  updateVehicle: (id: string, data: unknown) =>
    api.put<Vehicle>(`/admin/vehicles/${id}`, data),
  deleteVehicle: (id: string) => api.delete<Vehicle>(`/admin/vehicles/${id}`),
  uploadVehicleImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Vehicle>(`/admin/vehicles/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  listUsers: (params?: { role?: string; page?: number; size?: number }) =>
    api.get<PageResponse<User>>("/admin/users", { params }),
  createUser: (data: AdminCreateUserPayload) =>
    api.post<User>("/admin/users", data),
  updateUser: (id: string, data: unknown) =>
    api.put<User>(`/admin/users/${id}`, data),
  toggleUserStatus: (id: string) =>
    api.put<User>(`/admin/users/${id}/toggle-status`),
  getDriverAvailability: (driverId: string) =>
    api.get<DriverAvailability>(`/admin/drivers/${driverId}/availability`),
  blockDriverDate: (driverId: string, date: string) =>
    api.post<DriverAvailability>(
      `/admin/drivers/${driverId}/availability/block`,
      { date }
    ),
  unblockDriverDate: (driverId: string, date: string) =>
    api.delete<DriverAvailability>(
      `/admin/drivers/${driverId}/availability/unblock`,
      { params: { date } }
    ),
};

export const managerApi = {
  getDashboard: () => api.get<ManagerDashboardData>("/manager/dashboard"),
};

export const driverApi = {
  getAssignments: () => api.get("/driver/assignments"),
  updateAvailability: (data: unknown) =>
    api.put("/driver/availability", data),
};

export const financeApi = {
  getRevenueSummary: (from: string, to: string) =>
    api.get<RevenueSummary>("/finance/revenue-summary", { params: { from, to } }),
  getPricingRules: () => api.get<PricingRule[]>("/finance/pricing-rules"),
  updatePricingRule: (id: string, data: unknown) =>
    api.put<PricingRule>(`/finance/pricing-rules/${id}`, data),
  getExchangeRates: () => api.get<ExchangeRates>("/finance/exchange-rates"),
  updateExchangeRates: (rates: Record<string, number>) =>
    api.put<ExchangeRates>("/finance/exchange-rates", { rates }),
  getBookings: (params?: {
    status?: string;
    vehicleType?: string;
    currency?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) => api.get<PageResponse<FinanceBooking>>("/finance/bookings", { params }),
  getQuote: (params: Record<string, string | number>) =>
    pricingApi.quote(params),
};

export default api;
