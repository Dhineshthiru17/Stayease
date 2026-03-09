import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";
import stayEaseLogo from "../assets/stayease-logo-new.svg";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleAdminLogin = async () => {
    if (!email.trim() || !password) {
      showToast("Please enter admin email and password", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email: email.trim(),
        password
      });

      if (res.data.role !== "admin") {
        showToast("Only admin accounts can access admin dashboard", "error");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      sessionStorage.setItem("adminAuthenticated", "true");

      showToast("Admin authentication successful", "success");
      navigate("/admin");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showToast(error.response?.data || "Admin login failed", "error");
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
            <h2>Admin verification</h2>
            <p>Enter admin credentials to open the dashboard.</p>
          </div>
        </aside>

        <div className="auth-form auth-form-simple">
          <h1>Admin Login</h1>
          <p className="muted">This is a separate authentication step for admin access.</p>

          <input
            className="field"
            type="email"
            placeholder="Admin email"
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

          <button className="btn" onClick={handleAdminLogin} disabled={loading}>
            {loading ? "Verifying..." : "Verify and continue"}
          </button>

          <p className="auth-link">
            Back to user login? <button onClick={() => navigate("/")}>Go to sign in</button>
          </p>
        </div>
      </section>
    </div>
  );
}
