import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import stayEaseLogo from "../assets/stayease-logo-new.svg";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("adminAuthenticated");
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <Link to="/properties" className="brand" aria-label="StayEase home">
          <img className="brand-logo" src={stayEaseLogo} alt="StayEase" />
        </Link>

        <nav className="nav-links">
          {!token && (
            <>
              <NavLink to="/" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Register
              </NavLink>
            </>
          )}

          <NavLink to="/properties" className={navClass}>
            Properties
          </NavLink>

          {token && (
            <NavLink to="/my-bookings" className={navClass}>
              My Bookings
            </NavLink>
          )}

          {role === "admin" && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}

          {token && location.pathname !== "/" && (
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

