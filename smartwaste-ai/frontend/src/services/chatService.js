import api from "./api";

export async function sendChatMessage(message, sessionId) {
  const { data } = await api.post(
    "/chat",
    { message, session_id: sessionId },
    { timeout: 240000 }
  );
  return data; // { reply, session_id, model }
}

export async function getChatHistory(sessionId) {
  const { data } = await api.get("/chat/history", { params: { session_id: sessionId } });
  return data;
}
