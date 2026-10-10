import { NavLink } from "react-router-dom";
import { currentUser, logout } from "../services/authService";
import Icon from "./Icon";

const NAV = [
  { section: "Overview" },
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/analytics", label: "Analytics", icon: "chart" },
  { section: "Operations" },
  { to: "/scanner", label: "Waste Scanner", icon: "scan" },
  { to: "/reports", label: "Waste Reports", icon: "report" },
  { to: "/collections", label: "Collection Tasks", icon: "truck" },
];

function initials(name) {
  if (!name) return "SW";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Sidebar() {
  const user = currentUser();

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <span className="brand-mark">
          <Icon name="leaf" size={22} />
        </span>
        <span>
          <div className="side-brand-name">SmartWaste AI</div>
          <div className="side-brand-sub">Operations</div>
        </span>
      </div>

      <nav className="side-nav">
        {NAV.map((item, i) =>
          item.section ? (
            <div className="side-section" key={i}>
              {item.section}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "side-link active" : "side-link"
              }
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="side-footer">
        <div className="side-user">
          <span className="avatar">{initials(user?.name)}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <div className="side-user-name">{user?.name || "Operator"}</div>
            <div className="side-user-mail">{user?.email || ""}</div>
          </span>
          <button
            className="btn-ghost btn btn-sm"
            title="Sign out"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            style={{ padding: "0 8px" }}
          >
            <Icon name="logout" size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
