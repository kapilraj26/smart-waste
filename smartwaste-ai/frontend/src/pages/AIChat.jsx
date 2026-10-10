import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon";
import { getChatHistory, sendChatMessage } from "../services/chatService";
import { currentUser } from "../services/authService";

const SUGGESTIONS = [
  "Which bin does a pizza box go in?",
  "How do I dispose of old batteries?",
  "What can I put in the green compost bin?",
  "When is the next pickup in Sector 9?",
];

const SID_KEY = "sw_chat_sid";

export default function AIChat() {
  const user = currentUser();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SID_KEY) || "");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;
    getChatHistory(sessionId)
      .then((rows) => setMessages(rows.map((r) => ({ role: r.role, content: r.content }))))
      .catch(() => setMessages([]));
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setError("");
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setSending(true);
    try {
      const data = await sendChatMessage(message, sessionId || null);
      if (!sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem(SID_KEY, data.session_id);
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.detail || "Assistant unreachable. Is the backend and Ollama running?");
    } finally {
      setSending(false);
    }
  }

  function newChat() {
    setMessages([]);
    setSessionId("");
    localStorage.removeItem(SID_KEY);
    setError("");
  }

  return (
    <div className="chat-page">
      <div className="chat-thread">
        {messages.length === 0 && !sending && (
          <div className="chat-welcome">
            <span className="brand-mark" style={{ width: 48, height: 48, marginBottom: 4 }}>
              <Icon name="leaf" size={26} />
            </span>
            <h1>How can I help{user?.name ? `, ${user.name.split(" ")[0]}` : ""}?</h1>
            <p>Ask about bins, pickups, recycling rules, or your dashboard metrics.</p>
            <div className="chat-chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chat-chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div className={`chat-row ${m.role}`} key={i}>
            {m.role === "assistant" && (
              <span className="chat-avatar assistant"><Icon name="leaf" size={16} /></span>
            )}
            <div className="chat-bubble">{m.content}</div>
          </div>
        ))}

        {sending && (
          <div className="chat-row assistant">
            <span className="chat-avatar assistant"><Icon name="leaf" size={16} /></span>
            <div className="chat-bubble typing"><span /><span /><span /></div>
          </div>
        )}

        {error && <div className="form-error" style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="chat-composer-wrap">
        <div className="chat-composer">
          <textarea
            rows={1}
            placeholder="Message SmartWaste AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button className="chat-send" onClick={() => send()} disabled={!input.trim() || sending} aria-label="Send message">
            <Icon name="arrowRight" size={17} strokeWidth={2.2} />
          </button>
        </div>
        <div className="chat-foot">
          <span>Powered by Llama 3.2 via Ollama · history saved</span>
          <button className="link-btn" onClick={newChat}>New chat</button>
        </div>
      </div>
    </div>
  );
}
