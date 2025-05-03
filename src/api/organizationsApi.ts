import api from "./api";
import { useOrganizationStore } from "@/stores/organizationsStore";

export async function getOrganizations() {
  const options = {
    method: "GET",
    url: "/organization",
  };

  try {
    const { data } = await api.request(options);
    console.log(data);
    useOrganizationStore.getState().setOrganizations(data);
  } catch (error) {
    console.error(error);
  }
}

export async function postOrganization(name: string) {
  const options = {
    method: "POST",
    url: "/organization",
    headers: { "Content-Type": "application/json" },
    data: { name: name, active: true },
  };

  try {
    const { data } = await api.request(options);
    console.log(data);
    useOrganizationStore.getState().addOrganization(data);
  } catch (error) {
    console.error(error);
  }
}
