import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getUser as fetchUserApi } from "@/api/userApi"; // Assuming userApi.ts exports getUser

export type UserRole = "sys_admin" | "org_admin" | "org_user";

export type Organization = {
  id: number;
  name: string;
  active: boolean;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organization: Organization | null;
};

type UserState = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  fetchCurrentUser: () => Promise<boolean>;
  clearCurrentUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      fetchCurrentUser: async () => {
        try {
          const user = await fetchUserApi();
          if (user) {
            // Map backend user to FE User type
            const mappedUser: User = {
              id: user.id,
              name: user.name, // If backend uses username, adjust here
              email: user.email,
              role: user.role,
              organization: user.organization
                ? {
                    id: user.organization.id,
                    name: user.organization.name,
                    active: user.organization.active,
                  }
                : null,
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
