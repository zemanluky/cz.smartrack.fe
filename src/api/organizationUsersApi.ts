import { string } from "zod";
import api from "./api";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { data } from "react-router-dom";

interface Organization {
  id: number;
  name: string;
  active: boolean;
}

type User = {
  name: string;
  email: string;
  role: string;
};

interface responseUser {
  organization: Organization;
  role: string;
  email: string;
  name: string;
  active: boolean;
}

interface Metadata {
  page: number;
  limit: number;
  current_offset: number;
  has_next_page: boolean;
  total_results: number;
  filtered_total_results: number;
}

interface UsersResponse {
  metadata: Metadata;
  items: responseUser[];
}

export async function getUsersForOrganization(): Promise<
  UsersResponse | undefined
> {
  const options = {
    method: "GET",
    url: "/user/",
    headers: { "Content-Type": "application/json" },
  };

  try {
    const { data } = await api.request<UsersResponse>(options);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function postUserForOrganization(
  user: User
): Promise<User | undefined> {
  const options = {
    method: "POST",
    url: "/user/",
    headers: { "Content-Type": "application/json" },
    data: {
      name: user.name,
      email: user.email,
      organization_id: useOrganizationStore.getState().selectedOrganizationId,
      role: user.role,
    },
  };
  console.log(options.data);
  try {
    const { data } = await api.request<User>(options);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}
