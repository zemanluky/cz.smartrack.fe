import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getUsersForOrganization,
  postUserForOrganization,
  deleteUserForOrganization,
} from "@/api/organizationUsersApi";
import { number } from "zod";

type User = {
  name: string;
  email: string;
  role: string;
  active: boolean;
  id: number;
  organization: {
    id: number;
    name: string;
    active: boolean;
  };
};

type Metadata = {
  page: number;
  limit: number;
  current_offset: number;
  has_next_page: boolean;
  total_results: number;
  filtered_total_results: number;
};

type UserListResponse = {
  metadata: Metadata;
  items: User[];
};

type PostUser = {
  name: string;
  email: string;
  role: string;
  active: boolean;
};

type OrganizationUsersStore = {
  users: User[];
  loading: boolean;
  fetchUsers: (page: number) => Promise<UserListResponse | undefined>;
  addUser: (user: PostUser) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  editUser: (id: number, updatedUser: Partial<User>) => void;
};

export const useOrganizationUsersStore = create<OrganizationUsersStore>()(
  persist(
    (set) => ({
      users: [],
      loading: false,

      fetchUsers: async (page: number) => {
        set({ loading: true });
        try {
          const response = await getUsersForOrganization(page);
          set({ users: response?.items, loading: false });
          return response;
        } catch (error) {
          console.error("Failed to fetch users:", error);
          set({ users: [], loading: false });
        }
      },
      addUser: async (user: PostUser) => {
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
      deleteUser: async (id: number) => {
        try {
          const response = await deleteUserForOrganization(id);
          if (response) {
            set((state) => ({
              users: state.users.filter((user) => user.id !== id),
            }));
          }
        } catch (error) {
          console.error("Failed to delete user:", error);
        }
      },
      editUser: async (id: number, updatedUser: Partial<User>) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updatedUser } : user
          ),
        }));
      },
    }),
    {
      name: "organization-users-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ users: state.users }),
    }
  )
);
