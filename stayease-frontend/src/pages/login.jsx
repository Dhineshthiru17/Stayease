import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";
import stayEaseLogo from "../assets/stayease-logo-new.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast("Please enter email and password", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email: email.trim(),
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      sessionStorage.removeItem("adminAuthenticated");

      showToast("Login successful", "success");
      navigate("/properties");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showToast(error.response?.data || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-simple">
        <aside className="auth-hero auth-hero-simple">
          <img className="auth-brand-logo" src={stayEaseLogo} alt="StayEase logo" />
          <div>
            <h2>Welcome back to StayEase</h2>
            <p>Sign in to continue managing your bookings in one place.</p>
          </div>
        </aside>

        <div className="auth-form auth-form-simple">
          <h1>Sign in</h1>
          <p className="muted">Simple, fast, and secure access.</p>

          <input
            className="field"
            type="email"
            placeholder="Email address"
            autoComplete="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="field"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="auth-link">
            New to StayEase?{" "}
            <button onClick={() => navigate("/register")}>Create account</button>
          </p>
        </div>
      </section>
    </div>
  );
}
