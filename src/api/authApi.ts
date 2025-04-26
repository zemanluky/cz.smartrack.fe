import api from "./api";
import { useAuthStore } from "../stores/authStore";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    organizationId: string;
    role: string;
  };
};

export async function login(email: string, password: string) {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  useAuthStore.getState().login(res.data.user, res.data.token);
}
