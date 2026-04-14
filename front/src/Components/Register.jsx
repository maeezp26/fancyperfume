import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./css/Login.css";   // shares the same auth CSS
import { toast } from "react-toastify";
import { getIndiaCities } from "../utils/indiaLocations";
import SearchableSelect from "./common/SearchableSelect";
import { apiUrl } from "../utils/api";
import {
  PASSWORD_MIN_LENGTH,
  validateContact,
  validatePassword,
  validateRequiredAlphaText,
} from "../utils/validation";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Password strength scorer
const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)    score++;
  if (pw.length >= 12)   score++;
  if (/[a-z]/.test(pw))  score++;
  if (/[A-Z]/.test(pw))  score++;
  if (/\d/.test(pw))     score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};
const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "#e74c3c", "#f39c12", "#2ecc71", "#27ae60"];

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", contact: "", city: "", password: "", confirmPassword: "",
  });
  const [allCities, setAllCities]           = useState([]);
  const [selectedCityValue, setSelectedCityValue] = useState("");
  const [selectedCityName, setSelectedCityName]   = useState("");
  const [loading, setLoading]               = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const navigate  = useNavigate();
  const { register } = useAuth();

  const pwStrength = getStrength(formData.password);

  useEffect(() => { setAllCities(getIndiaCities()); }, []);

  const cityOptions = useMemo(() =>
    (allCities ?? []).map((c, idx) => ({
      label: c.name,
      value: `${c.name}__${c.stateCode ?? ""}__${idx}`,
    })),
  [allCities]);

  // ── Google GSI ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-reg-btn"),
        { theme: "filled_black", size: "large", width: 360, text: "signup_with", shape: "pill" }
      );
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

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
        window.location.href = "/";
      } else {
        toast.error(data.message || "Google sign-up failed");
      }
    } catch {
      toast.error("Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateRequiredAlphaText("Full name", formData.name, { min: 2 });
    if (nameErr) return toast.error(nameErr);

    const contactRes = validateContact(formData.contact);
    if (!contactRes.ok) return toast.error(contactRes.message);

    const cityErr = validateRequiredAlphaText("City", selectedCityName, { min: 2 });
    if (cityErr) return toast.error(cityErr);

    if (allCities.length > 0) {
      const match = allCities.some((c) => c?.name?.toLowerCase() === selectedCityName.trim().toLowerCase());
      if (!match) return toast.error("Please select a valid city from the list");
    }

    const pwErr = validatePassword(formData.password);
    if (pwErr) return toast.error(pwErr);

    if (formData.confirmPassword !== formData.password)
      return toast.error("Passwords do not match");

    setLoading(true);
    const result = await register({
      name:     formData.name.trim(),
      contact:  String(formData.contact).trim(),
      city:     selectedCityName.trim(),
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Account created! Welcome to Fancy Perfume 🎉");
      navigate("/");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/fp-logo.svg" alt="FP" />
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join Fancy Perfume and explore premium fragrances</p>

        {/* Google Sign-Up */}
        {GOOGLE_CLIENT_ID ? (
          <div className="google-btn-wrap">
            <div id="google-reg-btn"></div>
            {googleLoading && <p className="google-loading">Signing up with Google…</p>}
            <div className="auth-divider"><span>or register with email / phone</span></div>
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="field-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input type="text" id="name" name="name" placeholder="Your full name"
                value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          {/* Email / Phone */}
          <div className="field-group">
            <label htmlFor="contact">Email or Phone</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input type="text" id="contact" name="contact"
                placeholder="you@gmail.com or 9876543210"
                value={formData.contact} onChange={handleChange} required />
            </div>
          </div>

          {/* City */}
          <div className="field-group">
            <label htmlFor="city">City</label>
            <div className="input-wrap city-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <SearchableSelect
                name="city"
                value={selectedCityValue}
                onChange={(_val, opt) => {
                  const cityName = opt?.label ?? "";
                  setSelectedCityValue(_val);
                  setSelectedCityName(cityName);
                  setFormData((prev) => ({ ...prev, city: cityName }));
                }}
                options={cityOptions}
                placeholder="Select your city"
                searchPlaceholder="Type city name..."
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label htmlFor="password">
              Password
              <span className="pw-hint"> (min {PASSWORD_MIN_LENGTH} chars, A-Z, a-z, 0-9)</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input type={showPw ? "text" : "password"} id="password" name="password"
                placeholder="Create a strong password"
                value={formData.password} onChange={handleChange} required />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                {showPw ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {/* Password strength bar */}
            {formData.password && (
              <div className="pw-strength-wrap">
                <div className="pw-strength-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="pw-strength-seg"
                      style={{ background: i <= pwStrength ? STRENGTH_COLOR[pwStrength] : "rgba(255,255,255,0.1)" }}
                    />
                  ))}
                </div>
                <span className="pw-strength-label" style={{ color: STRENGTH_COLOR[pwStrength] }}>
                  {STRENGTH_LABEL[pwStrength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </span>
              <input type={showConfirm ? "text" : "password"} id="confirmPassword" name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword} onChange={handleChange} required />
              <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                {showConfirm ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="field-error">Passwords do not match</p>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <><span className="btn-spinner"></span>Creating account…</> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
