import { create } from "zustand";
import { login, logout } from "@/api/authApi";

type AuthState = {
  token: string | null;
  loginUser: (email: string, password: string) => Promise<string | null>;
  logoutUser: () => void;
  restoreSession: () => void;
  isSessionRestored: boolean;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isSessionRestored: false,

  loginUser: async (email: string, password: string) => {
    try {
      const token = await login(email, password);
      if (token) {
        localStorage.setItem("token", token);
        set({ token });
        return token;
      }
      return null;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    }
  },

  logoutUser: async () => {
    localStorage.removeItem("token");
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
    set({ token: null, isSessionRestored: false });
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
