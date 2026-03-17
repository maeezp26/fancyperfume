import React, { useState } from "react";
import axios from "axios";
import "./css/HeaderFooter.css";
import "./css/Feedback.css";
import feedbackImage from "./img/k (1).jpg";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    city: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleStarClick = (index) => {
    setRating(index + 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/feedback/add", {
        ...formData,
        rating,
      });
      setSubmitSuccess(true);
      setFormData({ name: "", emailOrPhone: "", city: "", message: "" });
      setRating(0);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      alert("Error submitting feedback. Try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="luxury-feedback">
      {/* Hero Header */}
      <section className="feedback-hero">
        <div className="hero-content">
          <h1 className="hero-title">Share Your Experience</h1>
          <p className="hero-subtitle">
            Your feedback helps us craft better fragrances
          </p>
        </div>
      </section>

      <div className="feedback-container">
        {/* Left Visual Section */}
        <div className="visual-section">
          <div className="image-container">
            <img src={feedbackImage} alt="Customer Experience" />
            <div className="image-overlay">
              <div className="overlay-content">
                <div className="rating-display">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="star filled">★</span>
                  ))}
                </div>
                <p>Thank you for being part of our fragrance journey</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="form-section">
          {submitSuccess ? (
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h2>Thank You!</h2>
              <p>Your feedback has been received. We truly appreciate your time!</p>
              <button 
                className="reset-btn"
                onClick={() => setSubmitSuccess(false)}
              >
                Give More Feedback
              </button>
            </div>
          ) : (
            <form id="feedback-form" className="luxury-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email or Phone</label>
                <input
                  type="text"
                  name="emailOrPhone"
                  placeholder="Enter email or phone number"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="rating-group">
                  <label>Rating</label>
                  <div className="star-rating">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`star ${index < rating ? "filled" : ""}`}
                        onClick={() => handleStarClick(index)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {rating === 0 && <p className="rating-hint">Click a star to rate</p>}
                </div>
              </div>

              <div className="form-group">
                <label>Feedback Message</label>
                <textarea
                  name="message"
                  placeholder="Share your experience with our fragrances..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || rating === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
