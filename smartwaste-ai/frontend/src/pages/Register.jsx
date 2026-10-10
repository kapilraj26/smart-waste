import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { registerUser } from "../services/authService";

const FEATURES = [
  { title: "One account for every tool", sub: "Scanner, reports, collections and analytics." },
  { title: "Secure by default", sub: "Credentials stored hashed in Postgres, JWT sessions." },
  { title: "Ready in seconds", sub: "Register and start logging waste immediately." },
];

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try another email.");
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
          <h2>Create your workspace account</h2>
          <p className="auth-brand-lead">
            Join the operations console to classify waste, manage
            pickups and measure impact.
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
              <b>340+</b>
              <span>Collection zones onboard</span>
            </div>
            <div className="auth-stat">
              <b>24/7</b>
              <span>AI classification availability</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="brand-mark">
            <Icon name="leaf" size={22} />
          </span>
          <h1>Get started</h1>
          <p className="auth-sub">Create an account to access the operations console.</p>

          <div className="field">
            <label className="field-label" htmlFor="reg-name">Full name</label>
            <div className="input-wrap">
              <span className="input-icon"><Icon name="user" size={17} /></span>
              <input
                id="reg-name"
                className="input"
                placeholder="Jordan Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="reg-email">Work email</label>
            <div className="input-wrap">
              <span className="input-icon"><Icon name="mail" size={17} /></span>
              <input
                id="reg-email"
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
            <label className="field-label" htmlFor="reg-password">Password</label>
            <div className="input-wrap">
              <span className="input-icon"><Icon name="lock" size={17} /></span>
              <input
                id="reg-password"
                className="input"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ marginTop: error ? 16 : 4 }}>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
              {!loading && <Icon name="arrowRight" size={16} />}
            </button>
          </div>

          <div className="auth-foot">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
