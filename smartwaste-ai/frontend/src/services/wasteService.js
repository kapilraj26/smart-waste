import api from "./api";

export async function classifyWaste(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/waste/classify", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listWasteRecords() {
  const { data } = await api.get("/waste/records").catch(() => ({ data: [] }));
  return data;
}
