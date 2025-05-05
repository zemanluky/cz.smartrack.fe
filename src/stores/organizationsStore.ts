import { create } from "zustand";
import { getOrganizations } from "../api/organizationsApi";

type Organization = {
  id: number;
  name: string;
  active: boolean;
};

type OrganizationStore = {
  organizations: Organization[];
  setOrganizations: () => Promise<boolean>;
  addOrganization: (org: Organization) => void;
  updateOrganization: (org: Organization) => void;
  removeOrganization: (id: number) => void;
};

export const useOrganizationStore = create<OrganizationStore>((set) => ({
  organizations: [],

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

  addOrganization: (org) =>
    set((state) => ({
      organizations: [...state.organizations, org],
    })),

  updateOrganization: (updatedOrg) =>
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === updatedOrg.id ? updatedOrg : org
      ),
    })),

  removeOrganization: (id) =>
    set((state) => ({
      organizations: state.organizations.filter((org) => org.id !== id),
    })),
}));
