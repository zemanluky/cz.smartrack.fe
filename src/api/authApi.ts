import api from "./api";

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
    console.log("Access token:", data.access);
    return data.access;
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
  } catch (error) {
    console.error(error);
  }
}
