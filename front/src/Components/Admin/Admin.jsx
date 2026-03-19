import { Link, useLocation, Outlet } from "react-router-dom";
import "./Admin.css";

export default function Admin() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">FP</div>
        <h2 className="sidebar-title">Admin Panel</h2>

        <nav className="admin-nav">
          <Link
            to="/admin/home"
            className={`nav-link ${isActive("/admin/home") ? "active" : ""}`}
          >
            Home Admin
          </Link>
          <Link
            to="/admin/product"
            className={`nav-link ${
              isActive("/admin/product") ? "active" : ""
            }`}
          >
            Product Admin
          </Link>
          <Link
              to="/admin/orders"
              className={`nav-link ${isActive("/admin/orders") ? "active" : ""}`}
            >
              Orders Admin
            </Link>
          <Link
            to="/admin/about"
            className={`nav-link ${isActive("/admin/about") ? "active" : ""}`}
          >
            About Admin
          </Link>
          <Link
            to="/admin/feedback"
            className={`nav-link ${
              isActive("/admin/feedback") ? "active" : ""
            }`}
          >
            Feedback Admin
          </Link>
          

        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
