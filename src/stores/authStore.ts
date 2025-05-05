import { create } from "zustand";
import { login, logout } from "../api/authApi";
import { getUser } from "../api/userApi";

type User = {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  role: "admin" | "owner" | "employee";
};

type AuthState = {
  user: User | null;
  token: string | null;
  loginUser: (email: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  restoreSession: () => void;
  isSessionRestored: boolean;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isSessionRestored: false,

  loginUser: async (email: string, password: string) => {
    try {
      const token = await login(email, password);
      if (token) {
        localStorage.setItem("token", token);
        set({ token });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  },

  logoutUser: async () => {
    localStorage.removeItem("token");
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
    set({ token: null });
  },

  getUser: async () => {
    try {
      const user = await getUser();
      if (user) {
        localStorage.setItem("user", user);
        set({ user });
        return true;
      }
      return false;
    } catch (error) {
      console.error("User fetch failed", error);
      return false;
    }
  },

  restoreSession: () => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      set({
        token: storedToken,
      });
    }
    set({ isSessionRestored: true });
  },
}));
