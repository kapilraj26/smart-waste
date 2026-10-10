import { currentUser } from "../services/authService";
import Icon from "./Icon";

function initials(name) {
  if (!name) return "SW";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Navbar({ title, crumb, onMenu }) {
  const user = currentUser();

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open navigation">
          <Icon name="menu" size={19} />
        </button>
        <div>
          <div className="topbar-title">{title}</div>
          {crumb && <div className="topbar-crumb">{crumb}</div>}
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Notifications" aria-label="Notifications">
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>
        <div className="topbar-user">
          <span className="avatar">{initials(user?.name)}</span>
          <span className="topbar-user-text">
            <div className="side-user-name">{user?.name || "Operator"}</div>
            <div className="side-user-mail">{user?.email || ""}</div>
          </span>
        </div>
      </div>
    </header>
  );
}
