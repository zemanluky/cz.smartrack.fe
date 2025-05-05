import api from "./api";

export async function getUser() {
  const options = {
    method: "GET",
    url: "/auth/identity",
    headers: { "Content-Type": "application/json" },
  };

  try {
    const { data } = await api.request(options);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}
