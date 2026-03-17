import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./css/Login.css";
import { toast } from "react-toastify";
import { isBlank } from "../utils/validation";

export default function Login() {
  const [credentials, setCredentials] = useState({
    usernameOrPhone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlank(credentials.usernameOrPhone)) {
      return toast.error("Username or phone is required");
    }
    if (isBlank(credentials.password)) {
      return toast.error("Password is required");
    }

    // If user entered only digits, treat it as phone (digits only rule)
    const u = String(credentials.usernameOrPhone).trim();
    const isDigits = /^\d+$/.test(u);
    if (isDigits && u.length !== 10) {
      return toast.error("Phone must be exactly 10 digits");
    }
    if (!isDigits && /[^a-zA-Z0-9 ]/.test(u)) {
      return toast.error("Username must not contain special characters");
    }

    setLoading(true);
    setError("");

    const result = await login(credentials);

    if (result.success) {
      toast.success("Logged in successfully");
      if (result.user.role === "admin") {
        navigate("/admin/home");
      } else {
        navigate("/");
      }
    } else {
      const msg = result.error || "Invalid credentials";
      setError(msg);
      toast.error(msg);
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">FP</div>
       <h2 className="login-title">Sign In</h2>
      <p className="login-subtitle">
        Access your Fancy Perfume account
      </p>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="usernameOrPhone">Username or Phone</label>
          <input
            type="text"
            id="usernameOrPhone"
            name="usernameOrPhone"
            placeholder="Enter username or phone"
            value={credentials.usernameOrPhone}
            onChange={handleChange}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter password"
            value={credentials.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
