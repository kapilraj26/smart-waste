import api from "./api";

export async function listReports() {
  const { data } = await api.get("/reports");
  return data;
}

export async function createReport(payload) {
  const { data } = await api.post("/reports", payload);
  return data;
}

export function formatReport(r) {
  const date = r.created_at ? new Date(r.created_at) : null;
  return {
    ...r,
    id: r.code,
    weight: `${r.weight_kg ?? 0} kg`,
    reportedAt: date ? date.toLocaleString() : "",
  };
}
