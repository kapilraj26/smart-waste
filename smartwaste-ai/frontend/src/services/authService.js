import api from "./api";

export async function registerUser({ name, email, password, role }) {
  const { data } = await api.post("/auth/register", { name, email, password, role });
  localStorage.setItem("sw_token", data.access_token);
  localStorage.setItem("sw_user", JSON.stringify(data.user));
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("sw_token", data.access_token);
  localStorage.setItem("sw_user", JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem("sw_token");
  localStorage.removeItem("sw_user");
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("sw_user"));
  } catch {
    return null;
  }
}

export function isManagement() {
  return (currentUser()?.role || "user").toLowerCase() === "management";
}
