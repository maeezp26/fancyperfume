import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { isBlank, validateContact } from "../utils/validation";
import { apiUrl } from "../utils/api";
import "./css/Login.css";
import "./css/ForgotPassword.css";

export default function ForgotPassword() {
  const [step, setStep]           = useState(1); // 1 = enter contact, 2 = enter OTP + new pw
  const [contact, setContact]     = useState("");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPw]   = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [cooldown, setCooldown]   = useState(0);
  const navigate = useNavigate();
  const otpRefs  = useRef([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // ── Step 1: Request OTP ──────────────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const trimmed = contact.trim();
    if (isBlank(trimmed)) return toast.error("Email or phone is required");

    const v = validateContact(trimmed);
    if (!v.ok) return toast.error(v.message);

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: trimmed }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent! Check your email or phone.");
        setStep(2);
        setCooldown(60);
        // Auto-focus first OTP input
        setTimeout(() => otpRefs.current[0]?.focus(), 200);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ──────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only single digit
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  // ── Step 2: Reset password ──────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) return toast.error("Please enter the complete 6-digit OTP");
    if (isBlank(newPassword))  return toast.error("New password is required");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPw) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contact.trim(), otp: otpStr, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contact.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("New OTP sent!");
        setCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        toast.error(data.message || "Failed to resend");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ──────────────────────────────────────────────────────
  const getPasswordStrength = () => {
    if (!newPassword) return { level: 0, label: "", color: "" };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "#ff4444" };
    if (score <= 2) return { level: 2, label: "Fair", color: "#ffaa00" };
    if (score <= 3) return { level: 3, label: "Good", color: "#88cc00" };
    return { level: 4, label: "Strong", color: "#00cc66" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/fp-logo.svg" alt="FP" />
        </div>

        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          {step === 1
            ? "Enter your registered email or phone number"
            : "Enter the OTP and set your new password"}
        </p>

        {/* Step indicator */}
        <div className="fp-steps">
          <div className={`fp-step ${step >= 1 ? "active" : ""}`}>
            <div className="fp-step-dot">1</div>
            <span>Verify</span>
          </div>
          <div className="fp-step-line">
            <div className={`fp-step-line-fill ${step >= 2 ? "filled" : ""}`} />
          </div>
          <div className={`fp-step ${step >= 2 ? "active" : ""}`}>
            <div className="fp-step-dot">2</div>
            <span>Reset</span>
          </div>
        </div>

        {step === 1 ? (
          /* ── STEP 1: Enter contact ──────────────────────────────────────── */
          <form className="auth-form" onSubmit={handleRequestOtp} noValidate>
            <div className="field-group">
              <label htmlFor="fp-contact">Email or Phone</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="text"
                  id="fp-contact"
                  placeholder="you@gmail.com or 9876543210"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <><span className="btn-spinner"></span>Sending OTP…</> : "Send OTP"}
            </button>
          </form>
        ) : (
          /* ── STEP 2: OTP + New password ──────────────────────────────────── */
          <form className="auth-form" onSubmit={handleResetPassword} noValidate>
            {/* OTP input boxes */}
            <div className="field-group">
              <label>Enter 6-digit OTP</label>
              <div className="fp-otp-row" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`fp-otp-input ${digit ? "filled" : ""}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              <div className="fp-otp-actions">
                <button
                  type="button"
                  className={`fp-resend-btn ${cooldown > 0 ? "disabled" : ""}`}
                  onClick={handleResend}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
                <button
                  type="button"
                  className="fp-change-btn"
                  onClick={() => { setStep(1); setOtp(["","","","","",""]); }}
                >
                  Change contact
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="field-group">
              <label htmlFor="fp-newpw">New Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  id="fp-newpw"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
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
              {newPassword && (
                <div className="pw-strength-wrap">
                  <div className="pw-strength-bar">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className="pw-strength-seg"
                        style={{ background: seg <= strength.level ? strength.color : "rgba(255,255,255,0.1)" }}
                      />
                    ))}
                  </div>
                  <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="field-group">
              <label htmlFor="fp-confirmpw">Confirm Password</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  id="fp-confirmpw"
                  placeholder="Re-enter your password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {confirmPw && confirmPw !== newPassword && (
                <p className="field-error">Passwords do not match</p>
              )}
              {confirmPw && confirmPw === newPassword && newPassword.length >= 6 && (
                <p className="fp-match-ok">✓ Passwords match</p>
              )}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <><span className="btn-spinner"></span>Resetting…</> : "Reset Password"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remember your password?{" "}
          <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
