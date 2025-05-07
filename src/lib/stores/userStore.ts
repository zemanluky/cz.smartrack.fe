import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getUser as fetchUserApi } from "@/api/userApi"; // Assuming userApi.ts exports getUser

export type UserRole = "sys_admin" | "org_admin"; // Adjusted roles

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string | null; // org_admin will have this, sys_admin might not initially
};

type UserState = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  fetchCurrentUser: () => Promise<boolean>;
  clearCurrentUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      fetchCurrentUser: async () => {
        try {
          const user = await fetchUserApi();
          if (user) {
            // Map backend role to frontend UserRole if necessary
            // For now, assuming backend role matches 'sys_admin' or 'org_admin'
            const mappedUser: User = {
              id: user.id,
              name: user.name || user.username, // Adjust if backend field names differ
              email: user.email,
              role: user.role, // Ensure this matches UserRole type
              organizationId: user.organizationId || null,
            };
            set({ currentUser: mappedUser });
            return true;
          }
          set({ currentUser: null });
          return false;
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          set({ currentUser: null });
          return false;
        }
      },
      clearCurrentUser: () => set({ currentUser: null }),
    }),
    {
      name: "user-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
