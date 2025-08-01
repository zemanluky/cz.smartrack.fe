import api from "./api";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { useUserStore } from "@/lib/stores/userStore";

interface Organization {
  id: number;
  name: string;
  active: boolean;
}

type User = {
  name: string;
  email: string;
  role: string;
  active: boolean;
  id: number;
  organization: Organization;
};

type PostUser = {
  name: string;
  email: string;
  role: string;
  active: boolean;
};

interface responseUser {
  organization: Organization;
  role: string;
  email: string;
  name: string;
  active: boolean;
  id: number;
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

export async function getUsersForOrganization(
  page: number = 1,
  limit: number = 20
): Promise<UsersResponse | undefined> {
  const currentUser = useUserStore.getState().currentUser;

  let url;
  if (currentUser?.role === "sys_admin") {
    const selectedOrgId = Number(
      useOrganizationStore.getState().selectedOrganizationId
    );
    console.log("Selected Organization ID:", selectedOrgId);
    url = `/user/?page=${page}&limit=${limit}&organization_id=${selectedOrgId}`;
  } else {
    url = `/user/?page=${page}&limit=${limit}`;
  }

  const options = {
    method: "GET",
    url,
    headers: {
      "Content-Type": "application/json",
    },
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
  user: PostUser
): Promise<User | undefined> {
  const options = {
    method: "POST",
    url: "/user/",
    headers: { "Content-Type": "application/json" },
    data: {
      name: user.name,
      email: user.email,
      active: user.active,
      organization_id: Number(
        useOrganizationStore.getState().selectedOrganizationId
      ),
      role: user.role,
    },
  };
  try {
    const { data } = await api.request<User>(options);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function putUserForOrganization(
  id: number,
  updatedUser: Partial<User>
): Promise<User | undefined> {
  const options = {
    method: "PUT",
    url: `/user/${id}`,
    headers: { "Content-Type": "application/json" },
    data: {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      organization_id: Number(
        updatedUser.organization?.id ||
          useOrganizationStore.getState().selectedOrganizationId
      ),
    },
  };
  try {
    const { data } = await api.request<User>(options);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

// export async function deleteUserForOrganization(
//   id: number
// ): Promise<Response | undefined> {
//   const options = {
//     method: "DELETE",
//     url: `/user/${id}`,
//     headers: { "Content-Type": "application/json" },
//   };
//   try {
//     return await api.request(options);
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function activateUser(id: number): Promise<User | undefined> {
//   const options = {
//     method: "PATCH",
//     url: `/user/${id}/active-status`,
//     headers: { "Content-Type": "application/json" },
//   };
//   try {
//     const { data } = await api.request<User>(options);
//     console.log(data);
//     return data;
//   } catch (error) {
//     console.error(error);
//   }
// }
