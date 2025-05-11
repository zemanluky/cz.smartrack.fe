import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getUsersForOrganization,
  postUserForOrganization,
} from "@/api/organizationUsersApi";

type User = {
  name: string;
  email: string;
  role: string;
};

type OrganizationUsersStore = {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => Promise<void>;
};

export const useOrganizationUsersStore = create<OrganizationUsersStore>()(
  persist(
    (set) => ({
      users: [],
      loading: false,

      fetchUsers: async () => {
        set({ loading: true });
        try {
          const response = await getUsersForOrganization();
          set({ users: response?.items, loading: false });
        } catch (error) {
          console.error("Failed to fetch users:", error);
          set({ users: [], loading: false });
        }
      },
      addUser: async (user: User) => {
        try {
          const response = await postUserForOrganization(user);
          if (response) {
            set((state) => ({
              users: [...state.users, response],
            }));
          }
        } catch (error) {
          console.error("Failed to add user:", error);
        }
      },
    }),
    {
      name: "organization-users-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ users: state.users }),
    }
  )
);
