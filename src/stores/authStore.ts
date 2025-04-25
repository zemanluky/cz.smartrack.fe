import { create } from "zustand";

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
  login: (user: User, token: string) => void;
  logout: () => void;
  restoreSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  restoreSession: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      set({
        user: JSON.parse(storedUser) as User,
        token: storedToken,
      });
    }
  },
}));
