import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getOrganizations,
  postOrganization,
  deleteOrganizations,
} from "@/api/organizationsApi";

export type Organization = {
  id: number;
  name: string;
  active: boolean;
};

type OrganizationStore = {
  organizations: Organization[];
  selectedOrganizationId: string | null;
  setOrganizations: () => Promise<boolean>;
  addOrganization: (name: string, active: boolean) => Promise<void>;
  updateOrganization: (org: Organization) => void;
  removeOrganization: (id: number) => void;
  setSelectedOrganizationId: (id: string | null) => void;
  clearSelectedOrganization: () => void;
};

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      organizations: [],
      selectedOrganizationId: null,

      setOrganizations: async () => {
        try {
          const res = await getOrganizations();
          if (res) {
            set({ organizations: res.items });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Orgs fetch failed", error);
          return false;
        }
      },

      addOrganization: async (name, active) => {
        try {
          const res = await postOrganization(name, active);
          set((state) => ({
            organizations: [...state.organizations, res],
          }));
        } catch (error) {
          console.error("Error adding organization:", error);
        }
      },

      updateOrganization: (updatedOrg) =>
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === updatedOrg.id ? updatedOrg : org
          ),
        })),

      removeOrganization: async (id) => {
        try {
          await deleteOrganizations(id);
          set((state) => ({
            organizations: state.organizations.filter((org) => org.id !== id),
          }));
        } catch (error) {
          console.error("Error removing organization:", error);
        }
      },

      setSelectedOrganizationId: (id: string | null) => {
        set({ selectedOrganizationId: id });
      },

      clearSelectedOrganization: () => {
        set({ selectedOrganizationId: null });
      },
    }),
    {
      name: "organization-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedOrganizationId: state.selectedOrganizationId,
      }),
    }
  )
);
