import { Navigate } from "react-router-dom";
import { isManagement } from "../services/authService";

/** Management-only routes. Operators are sent back to the dashboard. */
export default function ManagementRoute({ children }) {
  if (!localStorage.getItem("sw_token")) return <Navigate to="/login" replace />;
  if (!isManagement()) return <Navigate to="/dashboard" replace />;
  return children;
}
