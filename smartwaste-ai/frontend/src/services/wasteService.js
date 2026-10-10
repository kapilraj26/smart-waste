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

/** Send a photo (upload or camera capture) to the Ollama-backed analyzer. */
export async function analyzeWaste(imageBlob, hint) {
  const form = new FormData();
  form.append("file", imageBlob, "capture.jpg");
  if (hint && hint.trim()) form.append("hint", hint.trim());
  const { data } = await api.post("/waste/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 240000,
  });
  return data;
}
