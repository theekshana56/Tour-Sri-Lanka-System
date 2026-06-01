import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  AuthResponse,
  AvailabilityCalendarMap,
  BookingCreateResponse,
  CreateBookingPayload,
  CurrencyInfo,
  LoginRequest,
  PageResponse,
  Place,
  PlaceFilters,
  PriceQuote,
  PublicBookingTrack,
  RangeAvailability,
  RegisterRequest,
  TokenRefreshResponse,
  User,
  Vehicle,
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
};

export const adminApi = {
  listUsers: (params?: Record<string, string | number>) =>
    api.get("/admin/users", { params }),
  createUser: (data: unknown) => api.post("/admin/users", data),
};

export const driverApi = {
  getAssignments: () => api.get("/driver/assignments"),
  updateAvailability: (data: unknown) =>
    api.put("/driver/availability", data),
};

export const financeApi = {
  getPricingRules: () => api.get("/finance/pricing-rules"),
  getExchangeRates: () => api.get("/finance/exchange-rates"),
  getQuote: (params: Record<string, string | number>) =>
    pricingApi.quote(params),
};

export default api;
