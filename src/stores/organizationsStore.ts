import { create } from "zustand";

type Organization = {
  id: number;
  name: string;
  active: boolean;
};

type OrganizationStore = {
  organizations: Organization[];
  setOrganizations: (orgs: Organization[]) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (org: Organization) => void;
  removeOrganization: (id: number) => void;
};

const mockOrganizations: Organization[] = [
  { id: 1, name: "Organization A", active: true },
  { id: 2, name: "Organization B", active: false },
  { id: 3, name: "Organization C", active: true },
  { id: 4, name: "Organization D", active: false },
  { id: 5, name: "Organization E", active: true },
];

export const useOrganizationStore = create<OrganizationStore>((set) => ({
  organizations: mockOrganizations,

  setOrganizations: (orgs) => set({ organizations: orgs }),

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
