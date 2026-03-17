import React, { useState, useEffect } from "react";
import "./css/HeaderFooter.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import logo from "./img/fpLogo.jpg";

export default function Header() {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);


 useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(".user-profile")) {
      setProfileOpen(false);
    }
  };

  window.addEventListener("scroll", handleScroll);
  document.addEventListener("click", handleClickOutside);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    document.removeEventListener("click", handleClickOutside);
  };
}, []);


  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const isActiveLink = (path) => {
    return location.pathname === path || 
           (path === "/category" && location.pathname.startsWith("/category"));
  };

  return (
    <header className={`luxury-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo-link" onClick={closeMobile}>
          <div className="logo-wrapper">
            <img src={logo} alt="Fancy Perfume" className="logo-img" />
            <div className="logo-glow"></div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link 
            to="/" 
            className={`nav-item ${isActiveLink('/') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            Home
          </Link>
          <Link 
            to="/category" 
            className={`nav-item ${isActiveLink('/category') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            Category
          </Link>
          <Link 
            to="/about" 
            className={`nav-item ${isActiveLink('/about') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`nav-item ${isActiveLink('/contact') ? 'active' : ''}`}
            onClick={closeMobile}
          >
            Feedback
          </Link>
        </nav>

        {/* Desktop Right Section */}
        <div className="header-right">
         

          {/* Cart */}
          <Link to="/cart" className="cart-btn" onClick={closeMobile}>
            <div className="cart-icon-wrapper">
              <span className="cart-icon">🛒</span>
              {getCartItemCount() > 0 && (
                <div className="cart-badge">
                  {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
                </div>
              )}
            </div>
          </Link>

          {/* Auth Section */}
          <div className="auth-section">
            {user ? (
             <div className="user-profile" onClick={() => setProfileOpen(!profileOpen)}>
  <div className="user-avatar">
    {user.name?.charAt(0)?.toUpperCase() || "U"}
  </div>

  <div className="user-info">
    <span className="user-name">
      Hi, {user.name || "User"} <span className="caret">⌄</span>
    </span>

    {user.role === "admin" && (
  <Link
    to="/admin/home"
    className="dropdown-item admin"
    onClick={() => setProfileOpen(false)}
  >
    🛠 Admin Dashboard
  </Link>
)}

  </div>

  {/* Dropdown */}
  {profileOpen && (
    <div className="profile-dropdown">
      <Link
        to="/myorders"
        className="dropdown-item"
        onClick={() => {
          setProfileOpen(false);
          closeMobile();
        }}
      >
        📦 My Orders
      </Link>

      <div className="dropdown-item disabled">
        👤 My Profile
      </div>

      <button
        className="dropdown-item logout"
        onClick={handleLogout}
      >
        🚪 Logout
      </button>
    </div>
  )}
</div>

            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="auth-btn secondary" onClick={closeMobile}>
                  Login
                </Link>
                <Link to="/register" className="auth-btn primary" onClick={closeMobile}>
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`hamburger-btn ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-menu-top">
         
          <Link to="/cart" className="cart-btn mobile" onClick={closeMobile}>
            <div className="cart-icon-wrapper">
              <span className="cart-icon">🛒</span>
              {getCartItemCount() > 0 && (
                <div className="cart-badge">
                  {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
                </div>
              )}
            </div>
          </Link>
        </div>

        <nav className="mobile-nav">
          <Link to="/" className={`mobile-nav-item ${isActiveLink('/') ? 'active' : ''}`} onClick={closeMobile}>
            Home
          </Link>
          <Link to="/category" className={`mobile-nav-item ${isActiveLink('/category') ? 'active' : ''}`} onClick={closeMobile}>
            Category
          </Link>
          <Link to="/about" className={`mobile-nav-item ${isActiveLink('/about') ? 'active' : ''}`} onClick={closeMobile}>
            About
          </Link>
          <Link to="/contact" className={`mobile-nav-item ${isActiveLink('/contact') ? 'active' : ''}`} onClick={closeMobile}>
            Feedback
          </Link>

          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin/home" className="mobile-nav-item admin" onClick={closeMobile}>
                  Admin Panel
                </Link>
              )}
              <Link
                  to="/myorders"
                  className="mobile-nav-item"
                  onClick={closeMobile}
                >
                  📦 My Orders
                </Link>

              <button className="mobile-nav-item logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-item" onClick={closeMobile}>
                Login
              </Link>
              <Link to="/register" className="mobile-nav-item primary" onClick={closeMobile}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
