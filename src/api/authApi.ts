import api from "./api";
import { useAuthStore } from "../stores/authStore";

export async function login(email: string, password: string) {
  const options = {
    method: "POST",
    url: "/auth/login",
    headers: { "Content-Type": "application/json" },
    data: { email: email, password: password },
  };

  try {
    const { data } = await api.request(options);
    console.log(data);
    useAuthStore.getState().login(data.user, data.token);
  } catch (error) {
    console.error(error);
  }
}

export async function logout() {
  const options = {
    method: "DELETE",
    url: "/auth/logout",
  };

  try {
    const { data } = await api.request(options);
    console.log(data);
    useAuthStore.getState().logout();
  } catch (error) {
    console.error(error);
  }
}
