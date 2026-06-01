import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, configureApiAuth } from "@/lib/api";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth";
import type {
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        setAuthCookies(user.role);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      clearAuth: () => {
        clearAuthCookies();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),

      login: async (credentials) => {
        const { data } = await authApi.login(credentials);
        get().setAuth(data.user, data.accessToken, data.refreshToken);
        return data.user;
      },

      register: async (payload) => {
        const { data } = await authApi.register(payload);
        get().setAuth(data.user, data.accessToken, data.refreshToken);
        return data.user;
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch {
            // ignore logout errors
          }
        }
        get().clearAuth();
      },

      refreshAccessToken: async () => {
        const { refreshToken, user } = get();
        if (!refreshToken) {
          get().clearAuth();
          throw new Error("No refresh token");
        }
        const { data } = await authApi.refresh(refreshToken);
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          user: user ?? get().user,
        });
        if (user) {
          setAuthCookies(user.role);
        }
      },
    }),
    {
      name: "tsl-auth",
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

configureApiAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: () => useAuthStore.getState().refreshAccessToken(),
  logout: () => useAuthStore.getState().logout(),
});
