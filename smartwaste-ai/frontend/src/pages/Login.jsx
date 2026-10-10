import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { loginUser } from "../services/authService";

const FEATURES = [
  { title: "AI waste classification", sub: "Identify plastic, organic, e-waste and more from a photo." },
  { title: "Scheduled pickups", sub: "Assign, track and complete collection tasks by zone." },
  { title: "Reports and analytics", sub: "Monitor diversion rates and team performance." },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser({ email, password });
      if (!remember) sessionStorage.setItem("sw_session_only", "1");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <span className="auth-brand-badge">
            <Icon name="leaf" size={14} /> SmartWaste AI Platform
          </span>
          <h2>Waste operations, managed in one place</h2>
          <p className="auth-brand-lead">
            Classify waste with AI, coordinate collections and track
            performance across every zone.
          </p>
          <div className="auth-feat">
            {FEATURES.map((f) => (
              <div className="auth-feat-row" key={f.title}>
                <span className="auth-feat-check">
                  <Icon name="check" size={13} strokeWidth={2.4} />
                </span>
                <div>
                  <b>{f.title}</b>
                  <span>{f.sub}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="auth-stat-row">
            <div className="auth-stat">
              <b>12.4t</b>
              <span>Waste diverted this month</span>
            </div>
            <div className="auth-stat">
              <b>98.2%</b>
              <span>Pickup completion rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit} noValidate={false}>
          <span className="brand-mark">
            <Icon name="leaf" size={22} />
          </span>
          <h1>Welcome back</h1>
          <p className="auth-sub">Sign in to access the SmartWaste operations console.</p>

          <div className="field">
            <label className="field-label" htmlFor="login-email">Work email</label>
            <div className="input-wrap">
              <span className="input-icon"><Icon name="mail" size={17} /></span>
              <input
                id="login-email"
                className="input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="login-password">Password</label>
            <div className="input-wrap">
              <span className="input-icon"><Icon name="lock" size={17} /></span>
              <input
                id="login-password"
                className="input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="auth-meta-row">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className="link-btn" onClick={() => setError("Contact your workspace admin to reset your password.")}>
              Forgot password
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ marginTop: error ? 16 : 0 }}>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <Icon name="arrowRight" size={16} />}
            </button>
          </div>

          <div className="auth-foot">
            <span>New to SmartWaste?</span>
            <Link to="/register">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
