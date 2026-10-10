import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function NotFound() {
  return (
    <div className="page">
      <div className="card empty-center" style={{ maxWidth: 520, margin: "48px auto" }}>
        <span className="stat-icon" style={{ background: "var(--brand-50)", color: "var(--brand-700)", margin: "0 auto" }}>
          <Icon name="alert" size={24} />
        </span>
        <h1>Page not found</h1>
        <p>The page you requested does not exist or was moved.</p>
        <Link className="btn btn-primary" to="/dashboard">Back to dashboard</Link>
      </div>
    </div>
  );
}
