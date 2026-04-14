import React, { useState } from "react";
import axios from "axios";
import "./css/HeaderFooter.css";
import "./css/Feedback.css";
import { apiUrl } from "../utils/api";

const STARS = [1, 2, 3, 4, 5];

export default function Feedback() {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [formData, setFormData]   = useState({ name: "", emailOrPhone: "", city: "", message: "" });
  const [loading, setLoading]     = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { alert("Please select a rating."); return; }
    setLoading(true);
    try {
      // FIX: was literal string — now correct template literal
      await axios.post(apiUrl("/api/feedback/add"), { ...formData, rating });
      setSubmitSuccess(true);
      setFormData({ name: "", emailOrPhone: "", city: "", message: "" });
      setRating(0);
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (error) {
      alert("Error submitting feedback. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="luxury-feedback">
      {/* Hero */}
      <section className="feedback-hero">
        <div className="hero-content">
          <div className="hero-icon">✍️</div>
          <h1 className="hero-title">Share Your Experience</h1>
          <p className="hero-subtitle">Your feedback helps us craft better fragrances</p>
        </div>
      </section>

      <div className="feedback-center-wrap">
        {submitSuccess ? (
          <div className="success-card">
            <div className="success-glow"></div>
            <div className="success-icon-large">🎉</div>
            <h2>Thank You!</h2>
            <p>Your feedback has been received.<br />We truly appreciate your time!</p>
            <button className="reset-btn" onClick={() => setSubmitSuccess(false)}>
              Give More Feedback
            </button>
          </div>
        ) : (
          <div className="feedback-form-card">
            <h2 className="form-card-title">Write a Review</h2>

            {/* Star Rating — prominent */}
            <div className="rating-section">
              <p className="rating-label">How would you rate us?</p>
              <div className="big-star-row">
                {STARS.map(star => (
                  <button
                    type="button"
                    key={star}
                    className={`big-star ${star <= (hovered || rating) ? 'active' : ''}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="rating-label-text">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
                </p>
              )}
            </div>

            <form className="luxury-form" onSubmit={handleSubmit}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name <span className="req">*</span></label>
                  <input type="text" name="name" placeholder="Your name"
                    value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>City <span className="req">*</span></label>
                  <input type="text" name="city" placeholder="Your city"
                    value={formData.city} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Email or Phone <span className="req">*</span></label>
                <input type="text" name="emailOrPhone" placeholder="Enter email or phone number"
                  value={formData.emailOrPhone} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Your Feedback <span className="req">*</span></label>
                <textarea name="message" placeholder="Share your experience with our fragrances…"
                  value={formData.message} onChange={handleChange} required rows="5" />
              </div>

              <button type="submit" className="submit-btn" disabled={loading || rating === 0}>
                {loading ? (
                  <><span className="spinner"></span>Submitting…</>
                ) : (
                  "Submit Feedback ✨"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
