import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Navbar";

const TITLES = {
  "/dashboard": ["Dashboard", "Home / Dashboard"],
  "/scanner": ["Waste Scanner", "Operations / Waste Scanner"],
  "/reports": ["Waste Reports", "Operations / Waste Reports"],
  "/collections": ["Collection Tasks", "Operations / Collection Tasks"],
  "/analytics": ["Analytics", "Overview / Analytics"],
  "/assistant": ["AI Assistant", "Overview / AI Assistant"],
};

export default function UserLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  const [title, crumb] = TITLES[pathname] || ["SmartWaste AI", ""];

  return (
    <div className={`app-shell${navOpen ? " nav-open" : ""}`}>
      <Sidebar />
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <div className="main">
        <Topbar title={title} crumb={crumb} onMenu={() => setNavOpen((v) => !v)} />
        <Outlet />
      </div>
    </div>
  );
}
