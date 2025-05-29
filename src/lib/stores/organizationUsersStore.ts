import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getUsersForOrganization,
  postUserForOrganization,
  putUserForOrganization,
  deleteUserForOrganization,
  activateUserForOrganization,
} from "@/api/organizationUsersApi";

export type User = {
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
  totalUsersCount: number; // Added to store total number of users for pagination
  fetchUsers: (
    page: number,
    limit: number
  ) => Promise<UserListResponse | undefined>; // Added limit parameter
  addUser: (user: PostUser) => Promise<void>;
  editUser: (id: number, updatedUser: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  activateUser: (id: number) => Promise<void>;
};

export const useOrganizationUsersStore = create<OrganizationUsersStore>()(
  persist(
    (set) => ({
      users: [],
      loading: false,
      totalUsersCount: 0, // Initialize totalUsersCount

      fetchUsers: async (page: number, limit: number) => {
        // Added limit parameter
        set({ loading: true });
        try {
          const response = await getUsersForOrganization(page, limit); // Pass limit to API call
          if (response) {
            set({
              users: response.items,
              loading: false,
              totalUsersCount: response.metadata.total_results,
            });
          } else {
            set({ users: [], loading: false, totalUsersCount: 0 });
          }
          return response;
        } catch (error) {
          console.error("Failed to fetch users:", error);
          set({ users: [], loading: false, totalUsersCount: 0 });
          return undefined; // Ensure a UserListResponse | undefined is returned
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
      editUser: async (id: number, updatedUser: Partial<User>) => {
        try {
          await putUserForOrganization(id, updatedUser).then(
            (response: User | undefined) => {
              if (response) {
                set((state) => ({
                  users: state.users.map((user) =>
                    user.id === id ? { ...user, ...updatedUser } : user
                  ),
                }));
              }
            }
          );
        } catch (error) {
          console.error("Failed to update user:", error);
        }
      },
      deleteUser: async (id: number) => {
        try {
          await deleteUserForOrganization(id);
        } catch (error) {
          console.error("Failed to delete user:", error);
        }
      },
      activateUser: async (id: number) => {
        try {
          await activateUserForOrganization(id);
        } catch (error) {
          console.error("Failed to activate user:", error);
        }
      },
    }),
    {
      name: "organization-users-storage",
      storage: createJSONStorage(() => localStorage),
      // Do not persist totalUsersCount as it should be fetched fresh
      partialize: (state) => ({ users: state.users }),
    }
  )
);
