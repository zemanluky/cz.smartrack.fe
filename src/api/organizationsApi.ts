import api from "./api";

export async function getOrganizations() {
  const options = {
    method: "GET",
    url: "/organization",
  };

  try {
    const { data } = await api.request(options);
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function postOrganization(name: string, active: boolean) {
  const options = {
    method: "POST",
    url: "/organization",
    headers: { "Content-Type": "application/json" },
    data: { name: name, active: active },
  };

  try {
    const { data } = await api.request(options);
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteOrganizations(id: number) {
  const options = {
    method: "DELETE",
    url: `/organization/${id}`,
  };

  try {
    const res = await api.request(options);
    console.log(res);
  } catch (error) {
    console.error(error);
  }
}
