import create from "zustand";
import { apiGet, setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from "../lib/apiClient";

export type UserRole = "compliance_officer" | "risk_analyst" | "reviewer" | "compliance_manager" | "system_admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions?: string[];
  department?: string;
  status?: "active" | "inactive" | "suspended";
  lastLogin?: string;
  createdAt?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (payload: { accessToken: string; refreshToken?: string | null; user?: User | null }) => void;
  fetchMe: () => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: getAccessToken(),
  permissions: [],
  isAuthenticated: !!getAccessToken(),

  setUser(user) {
    set({ user, permissions: user?.permissions ?? [] });
  },

  setToken(token) {
    set({ token, isAuthenticated: !!token });
    // persist token via apiClient helper
    setAuthTokens(token, getRefreshToken());
  },

  login(payload) {
    setAuthTokens(payload.accessToken, payload.refreshToken ?? null);
    set({ token: payload.accessToken, user: payload.user ?? null, permissions: payload.user?.permissions ?? [], isAuthenticated: true });
  },

  async fetchMe() {
    try {
      const data = await apiGet<any>("/auth/me");
      // API client returns the inner data (user object)
      set({ user: data, permissions: data?.permissions ?? [] });
    } catch (err) {
      // silently fail — callers can react
      console.error("fetchMe failed", err);
    }
  },

  logout() {
    clearAuthTokens();
    set({ user: null, token: null, permissions: [], isAuthenticated: false });
    if (typeof window !== "undefined") window.location.href = "/login";
  },

  hasPermission(permission) {
    const user = get().user;
    if (!user) return false;
    if (user.role === "system_admin") return true;
    const perms = get().permissions ?? [];
    return perms.includes(permission) || perms.includes("*");
  },
}));

export default useAuthStore;
