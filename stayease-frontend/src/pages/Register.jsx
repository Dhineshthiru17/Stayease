import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";
import stayEaseLogo from "../assets/stayease-logo-new.svg";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const passwordChecks = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "One symbol", valid: /[^A-Za-z0-9]/.test(password) }
  ];

  const passwordScore = passwordChecks.filter((rule) => rule.valid).length;
  const strengthLabel =
    passwordScore <= 1 ? "Weak" : passwordScore <= 3 ? "Good" : "Strong";

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showToast("Please fill all fields", "warning");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "warning");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password
      });

      showToast("Registration successful. Please login.", "success");
      navigate("/");
    } catch (error) {
      console.log(error.response?.data || error.message);
      showToast(error.response?.data || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <aside className="auth-hero">
          <img className="auth-brand-logo" src={stayEaseLogo} alt="StayEase logo" />
          <div>
            <h2>Set up your traveler account in minutes.</h2>
            <p>
              Get instant access to curated stays, secure bookings, and booking
              history tracking.
            </p>
          </div>

          <ul className="auth-list">
            <li>Personalized recommendations</li>
            <li>Simple checkout and secure payments</li>
            <li>One dashboard for all reservations</li>
          </ul>
        </aside>

        <div className="auth-form auth-form-register">
          <span className="auth-eyebrow">Join StayEase</span>
          <h1>Create account</h1>
          <p className="muted">Start booking quality stays with a faster setup.</p>

          <input
            className="field"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="field"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrap">
            <input
              className="field"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="strength-meter">
            <div
              className={`strength-fill strength-${passwordScore}`}
              style={{ width: `${(passwordScore / 4) * 100}%` }}
            />
          </div>
          <p className="strength-text">Password strength: {strengthLabel}</p>

          <ul className="password-rules">
            {passwordChecks.map((rule) => (
              <li key={rule.label} className={rule.valid ? "rule-ok" : ""}>
                {rule.label}
              </li>
            ))}
          </ul>

          <div className="password-wrap">
            <input
              className="field"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="btn" onClick={handleRegister} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="auth-link">
            Already have an account? <button onClick={() => navigate("/")}>Login</button>
          </p>
        </div>
      </section>
    </div>
  );
}

