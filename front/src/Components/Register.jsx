import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./css/Register.css";
import { toast } from "react-toastify";
import { getIndiaCities } from "../utils/indiaLocations";
import SearchableSelect from "./common/SearchableSelect";
import {
  PASSWORD_MIN_LENGTH,
  validateContact,
  validatePassword,
  validateRequiredAlphaText,
} from "../utils/validation";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [allCities, setAllCities] = useState([]);
  const [selectedCityValue, setSelectedCityValue] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    // Load once; we’ll filter client-side as user types.
    setAllCities(getIndiaCities());
  }, []);

  const cityOptions = useMemo(() => {
    // NOTE: India has many duplicate city names across states.
    // Use a unique value so React keys + selection stay stable.
    return (allCities ?? []).map((c, idx) => ({
      label: c.name,
      value: `${c.name}__${c.stateCode ?? ""}__${idx}`,
    }));
  }, [allCities]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation (keeps backend payload unchanged)
    const nameErr = validateRequiredAlphaText("Full name", formData.name, { min: 2 });
    if (nameErr) return toast.error(nameErr);

    const contactRes = validateContact(formData.contact);
    if (!contactRes.ok) return toast.error(contactRes.message);

    const cityErr = validateRequiredAlphaText("City", selectedCityName, { min: 2 });
    if (cityErr) return toast.error(cityErr);

    // Ensure city is a valid India city name (from list)
    const cityLower = selectedCityName.trim().toLowerCase();
    if (allCities.length > 0) {
      const match = allCities.some((c) => c?.name?.toLowerCase() === cityLower);
      if (!match) return toast.error("Please select a valid city from the list");
    }

    const pwErr = validatePassword(formData.password);
    if (pwErr) return toast.error(pwErr);

    if (formData.confirmPassword !== formData.password) {
      return toast.error("Confirm password does not match");
    }

    setLoading(true);
    setError("");

    const result = await register({
      name: formData.name.trim(),
      contact: String(formData.contact).trim(),
      city: selectedCityName.trim(),
      password: formData.password,
    });

    if (result.success) {
      toast.success("Account created successfully");
      navigate("/");
    } else {
      const msg = result.error || "Registration failed";
      setError(msg);
      toast.error(msg);
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-logo">FP</div>
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">
          Join Fancy Perfume and explore premium fragrances
        </p>

        {error && <div className="error-message">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="contact">Email or Phone</label>
          <input
            type="text"
            id="contact"
            name="contact"
            placeholder="Enter email or phone"
            value={formData.contact}
            onChange={handleChange}
            required
          />

          <label htmlFor="city">City</label>
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
            placeholder="Select City"
            searchPlaceholder="Type city name..."
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder={`Min ${PASSWORD_MIN_LENGTH} chars (A-z, a-z, 0-9)`}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
