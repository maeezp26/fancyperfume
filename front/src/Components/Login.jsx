import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./css/Login.css";
import { toast } from "react-toastify";
import { isBlank } from "../utils/validation";
import { apiUrl } from "../utils/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const [credentials, setCredentials] = useState({ usernameOrPhone: "", password: "" });
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw]           = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Load Google GSI script ─────────────────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  const initGoogle = () => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-btn"),
      { theme: "filled_black", size: "large", width: 360, text: "continue_with", shape: "pill" }
    );
  };

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/google"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Trigger AuthContext to pick up new token
        window.location.href = data.user.role === "admin" ? "/admin/home" : "/";
      } else {
        toast.error(data.message || "Google sign-in failed");
      }
    } catch (err) {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const u = String(credentials.usernameOrPhone).trim();
    if (isBlank(u))                  return toast.error("Email or phone is required");
    if (isBlank(credentials.password)) return toast.error("Password is required");

    // BUG FIX: Old code had /[^a-zA-Z0-9 ]/.test(u) which blocked @ and . in emails
    // → anyone who registered with Gmail literally could not log in!
    // Now we only validate phone-only input (all digits, must be 10 digits)
    const isAllDigits = /^\d+$/.test(u);
    if (isAllDigits && u.length !== 10) {
      return toast.error("Phone number must be exactly 10 digits");
    }
    // If it contains @ it's an email — accept as-is, backend handles lookup
    // If no @ and not digits → invalid
    if (!isAllDigits && !u.includes("@")) {
      return toast.error("Enter a valid email (e.g. you@gmail.com) or 10-digit phone number");
    }

    setLoading(true);
    const result = await login(credentials);
    setLoading(false);

    if (result.success) {
      toast.success("Welcome back!");
      navigate(result.user.role === "admin" ? "/admin/home" : "/");
    } else {
      toast.error(result.error || "Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/fp-logo.svg" alt="FP" />
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your Fancy Perfume account</p>

        {/* Google Sign-In */}
        {GOOGLE_CLIENT_ID ? (
          <div className="google-btn-wrap">
            <div id="google-signin-btn"></div>
            {googleLoading && <p className="google-loading">Signing in with Google…</p>}
            <div className="auth-divider"><span>or sign in with email / phone</span></div>
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email / Phone field */}
          <div className="field-group">
            <label htmlFor="usernameOrPhone">Email or Phone</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                type="text"
                id="usernameOrPhone"
                name="usernameOrPhone"
                placeholder="you@gmail.com or 9876543210"
                value={credentials.usernameOrPhone}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPw ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                {showPw ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <><span className="btn-spinner"></span>Signing in…</> : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
