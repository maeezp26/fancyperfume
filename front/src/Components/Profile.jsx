import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./css/Profile.css";
import { apiUrl } from "../utils/api";

export default function Profile() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode]     = useState(false);
  const [pwMode, setPwMode]         = useState(false);
  const [saving, setSaving]         = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    city: user?.city || "",
  });

  const [pwData, setPwData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-lock">
          <div className="lock-icon">🔒</div>
          <h2>Login Required</h2>
          <p>Please login to view your profile.</p>
          <button className="pf-btn primary" onClick={() => navigate("/login")}>Login</button>
        </div>
      </main>
    );
  }

  const handleSaveInfo = async () => {
    if (!formData.name.trim()) return toast.error("Name cannot be empty");
    if (!formData.city.trim()) return toast.error("City cannot be empty");
    setSaving(true);
    try {
      const res = await axios.put(apiUrl("/api/auth/profile"),
        { name: formData.name, city: formData.city },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update localStorage so header shows new name
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      // Re-trigger auth context
      window.location.reload(); // simple refresh to reflect updated name
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!pwData.currentPassword) return toast.error("Enter your current password");
    if (pwData.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (pwData.newPassword !== pwData.confirmPassword) return toast.error("Passwords do not match");
    setSaving(true);
    try {
      await axios.put(apiUrl("/api/auth/profile"),
        { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password updated! Please login again.");
      setTimeout(() => { logout(); navigate("/login"); }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const initial = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="profile-page">
      {/* Header strip */}
      <div className="profile-hero">
        <div className="profile-hero-bg"></div>
        <div className="profile-hero-content">
          <div className="profile-avatar-large">{initial}</div>
          <div>
            <h1 className="profile-hero-name">{user.name}</h1>
            <p className="profile-hero-role">{user.role === "admin" ? "👑 Administrator" : "🌿 Customer"}</p>
          </div>
        </div>
      </div>

      <div className="profile-body">
        {/* Info Card */}
        <div className="pf-card">
          <div className="pf-card-header">
            <div>
              <h2 className="pf-card-title">Account Information</h2>
              <p className="pf-card-sub">Manage your personal details</p>
            </div>
            {!editMode ? (
              <button className="pf-btn outline" onClick={() => setEditMode(true)}>✏️ Edit</button>
            ) : (
              <div className="pf-btn-row">
                <button className="pf-btn ghost" onClick={() => { setEditMode(false); setFormData({ name: user.name, city: user.city }); }}>Cancel</button>
                <button className="pf-btn primary" onClick={handleSaveInfo} disabled={saving}>{saving ? "Saving…" : "💾 Save"}</button>
              </div>
            )}
          </div>

          <div className="pf-info-grid">
            {/* Name */}
            <div className="pf-field">
              <label className="pf-label">Full Name</label>
              {editMode ? (
                <input className="pf-input" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="Your full name" />
              ) : (
                <p className="pf-value">{user.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="pf-field">
              <label className="pf-label">Email</label>
              <p className="pf-value pf-muted">{user.email || "—"} <span className="pf-readonly-badge">read-only</span></p>
            </div>

            {/* Phone */}
            <div className="pf-field">
              <label className="pf-label">Phone</label>
              <p className="pf-value pf-muted">{user.phone || "—"} <span className="pf-readonly-badge">read-only</span></p>
            </div>

            {/* City */}
            <div className="pf-field">
              <label className="pf-label">City</label>
              {editMode ? (
                <input className="pf-input" value={formData.city} onChange={e => setFormData(p => ({...p, city: e.target.value}))} placeholder="Your city" />
              ) : (
                <p className="pf-value">{user.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="pf-card">
          <div className="pf-card-header">
            <div>
              <h2 className="pf-card-title">Change Password</h2>
              <p className="pf-card-sub">Keep your account secure</p>
            </div>
            {!pwMode ? (
              <button className="pf-btn outline" onClick={() => setPwMode(true)}>🔑 Change</button>
            ) : (
              <div className="pf-btn-row">
                <button className="pf-btn ghost" onClick={() => { setPwMode(false); setPwData({ currentPassword:"", newPassword:"", confirmPassword:"" }); }}>Cancel</button>
                <button className="pf-btn primary" onClick={handleSavePassword} disabled={saving}>{saving ? "Saving…" : "💾 Save"}</button>
              </div>
            )}
          </div>

          {pwMode ? (
            <div className="pf-info-grid">
              <div className="pf-field pf-full">
                <label className="pf-label">Current Password</label>
                <input className="pf-input" type="password" placeholder="Enter current password"
                  value={pwData.currentPassword} onChange={e => setPwData(p => ({...p, currentPassword: e.target.value}))} />
              </div>
              <div className="pf-field">
                <label className="pf-label">New Password</label>
                <input className="pf-input" type="password" placeholder="At least 6 characters"
                  value={pwData.newPassword} onChange={e => setPwData(p => ({...p, newPassword: e.target.value}))} />
              </div>
              <div className="pf-field">
                <label className="pf-label">Confirm New Password</label>
                <input className="pf-input" type="password" placeholder="Repeat new password"
                  value={pwData.confirmPassword} onChange={e => setPwData(p => ({...p, confirmPassword: e.target.value}))} />
              </div>
            </div>
          ) : (
            <p className="pf-pw-placeholder">••••••••••••  <span className="pf-muted">(hidden for security)</span></p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pf-card pf-actions-card">
          <h2 className="pf-card-title">Quick Actions</h2>
          <div className="pf-quick-actions">
            <button className="pf-action-tile" onClick={() => navigate("/myorders")}>
              <span className="pf-action-icon">📦</span>
              <span>My Orders</span>
            </button>
            <button className="pf-action-tile" onClick={() => navigate("/category")}>
              <span className="pf-action-icon">🛍️</span>
              <span>Shop Now</span>
            </button>
            <button className="pf-action-tile" onClick={() => navigate("/cart")}>
              <span className="pf-action-icon">🛒</span>
              <span>My Cart</span>
            </button>
            <button className="pf-action-tile danger" onClick={() => { logout(); navigate("/"); }}>
              <span className="pf-action-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
