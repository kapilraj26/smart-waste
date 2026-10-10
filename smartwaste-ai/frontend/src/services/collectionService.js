import api from "./api";

export async function listCollections() {
  const { data } = await api.get("/collections");
  return data;
}

export async function createCollection(payload) {
  const { data } = await api.post("/collections", payload);
  return data;
}

export async function updateCollection(id, payload) {
  const { data } = await api.patch(`/collections/${id}`, payload);
  return data;
}

export async function getAnalyticsSummary() {
  const { data } = await api.get("/analytics/summary");
  return data;
}
