import React, { useState, useEffect } from "react";
import "./css/HeaderFooter.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-profile")) setProfileOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = () => { logout(); navigate("/"); setMobileOpen(false); };
  const closeMobile  = () => setMobileOpen(false);
  const isActive     = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <header className={`luxury-header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* SVG Logo */}
        <Link to="/" className="logo-link" onClick={closeMobile}>
          <div className="logo-wrapper">
            <img src="/fp-logo.svg" alt="Fancy Perfume" className="logo-img" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          {[["/" ,"Home"],["/category","Category"],["/about","About"],["/contact","Feedback"]].map(([path, label]) => (
            <Link key={path} to={path} className={`nav-item ${isActive(path) ? "active" : ""}`} onClick={closeMobile}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
          <Link to="/cart" className="cart-btn" onClick={closeMobile}>
            <div className="cart-icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {getCartItemCount() > 0 && (
                <div className="cart-badge">{getCartItemCount() > 99 ? "99+" : getCartItemCount()}</div>
              )}
            </div>
          </Link>

          <div className="auth-section">
            {user ? (
              <div className="user-profile" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
                <div className="user-info">
                  <span className="user-name">Hi, {user.name?.split(" ")[0] || "User"} <span className="caret">▾</span></span>
                  {user.role === "admin" && (
                    <Link to="/admin/home" className="dropdown-item admin" onClick={() => setProfileOpen(false)}>
                      🛠 Admin Dashboard
                    </Link>
                  )}
                </div>
                {profileOpen && (
                  <div className="profile-dropdown">
                    <Link to="/myorders"  className="dropdown-item" onClick={() => { setProfileOpen(false); closeMobile(); }}>📦 My Orders</Link>
                    <Link to="/profile"   className="dropdown-item" onClick={() => { setProfileOpen(false); closeMobile(); }}>👤 My Profile</Link>
                    <button className="dropdown-item logout" onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login"    className="auth-btn secondary" onClick={closeMobile}>Login</Link>
                <Link to="/register" className="auth-btn primary"   onClick={closeMobile}>Join Now</Link>
              </div>
            )}
          </div>
        </div>

        {/* Hamburger */}
        <button className={`hamburger-btn ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <span/><span/><span/>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <nav className="mobile-nav">
          {[["/" ,"🏠 Home"],["/category","🛍️ Category"],["/about","ℹ️ About"],["/contact","💬 Feedback"]].map(([path, label]) => (
            <Link key={path} to={path} className={`mobile-nav-item ${isActive(path) ? "active" : ""}`} onClick={closeMobile}>{label}</Link>
          ))}
          <Link to="/cart" className="mobile-nav-item" onClick={closeMobile}>🛒 Cart {getCartItemCount() > 0 && `(${getCartItemCount()})`}</Link>
          {user ? (
            <>
              {user.role === "admin" && <Link to="/admin/home" className="mobile-nav-item admin" onClick={closeMobile}>🛠 Admin Panel</Link>}
              <Link to="/myorders" className="mobile-nav-item" onClick={closeMobile}>📦 My Orders</Link>
              <Link to="/profile"  className="mobile-nav-item" onClick={closeMobile}>👤 My Profile</Link>
              <button className="mobile-nav-item logout" onClick={handleLogout}>🚪 Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="mobile-nav-item" onClick={closeMobile}>Login</Link>
              <Link to="/register" className="mobile-nav-item primary" onClick={closeMobile}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
