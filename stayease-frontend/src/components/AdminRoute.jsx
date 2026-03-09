import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const adminAuthenticated = sessionStorage.getItem("adminAuthenticated");

  if (!token || role !== "admin" || adminAuthenticated !== "true") {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
