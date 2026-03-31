import React, { useState, useEffect } from "react";
import "./FeedbackAdmin.css";
import axios from "axios";

const StarRating = ({ rating }) => (
  <div className="star-row">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`admin-star ${i <= rating ? 'filled' : 'empty'}`}>★</span>
    ))}
    <span className="rating-num">({rating}/5)</span>
  </div>
);

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // FIX: was literal string "import.meta.env.VITE_API_URL/api/feedback" — not a template literal!
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback`);
        setFeedbacks(response.data || []);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback permanently?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/feedback/${id}`);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Error deleting feedback. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  return (
    <div className="feedback-admin-container">
      <div className="feedback-admin-header">
        <div>
          <h2 className="feedback-admin-title">Customer Feedback</h2>
          <p className="feedback-admin-sub">{feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''} · Avg rating: <strong className="avg-gold">{avgRating} ★</strong></p>
        </div>
      </div>

      {loading ? (
        <div className="feedback-loading">
          <div className="feedback-spinner"></div>
          <p>Loading feedback…</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="feedback-empty">
          <div className="empty-emoji">💬</div>
          <h3>No feedback yet</h3>
          <p>Customer reviews will appear here.</p>
        </div>
      ) : (
        <div className="feedback-cards-grid">
          {feedbacks.map(feedback => (
            <div className="feedback-card" key={feedback._id}>
              <div className="feedback-card-header">
                <div className="feedback-avatar">
                  {feedback.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="feedback-meta">
                  <h4 className="feedback-name">{feedback.name}</h4>
                  <p className="feedback-contact">{feedback.emailOrPhone}</p>
                </div>
                <button
                  className={`fb-delete-btn ${deletingId === feedback._id ? 'deleting' : ''}`}
                  onClick={() => deleteFeedback(feedback._id)}
                  disabled={deletingId === feedback._id}
                  title="Delete feedback"
                >
                  {deletingId === feedback._id ? '⏳' : '✕'}
                </button>
              </div>

              <div className="feedback-card-body">
                <div className="feedback-location">📍 {feedback.city}</div>
                <StarRating rating={feedback.rating} />
                <p className="feedback-message">"{feedback.message}"</p>
              </div>

              {feedback.createdAt && (
                <div className="feedback-card-footer">
                  {new Date(feedback.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
