import React, { useState, useEffect } from "react";
import "./FeedbackAdmin.css";
import axios from "axios";

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
<<<<<<< HEAD
        const response = await axios.get("http://localhost:5000/api/feedback");
=======
        const response = await axios.get("import.meta.env.VITE_API_URL/api/feedback");
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
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
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
<<<<<<< HEAD
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
=======
      await axios.delete(`import.meta.env.VITE_API_URL/api/feedback/${id}`);
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Error deleting feedback. Try again.");
    }
  };

  return (
    <div className="feedback-admin-container">
      <h2>Feedback Submissions</h2>
      {loading ? (
        <p className="feedback-admin-status">Loading feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <p className="feedback-admin-status">No feedback available.</p>
      ) : (
        <div className="feedback-table-wrapper">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>City</th>
                <th>Message</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback) => (
                <tr key={feedback._id}>
                  <td>{feedback.name}</td>
                  <td>{feedback.emailOrPhone}</td>
                  <td>{feedback.city}</td>
                  <td className="feedback-message-cell">{feedback.message}</td>
                  <td>
                    {[...Array(feedback.rating)].map((_, i) => (
                      <span key={i} className="admin-star">
                        ★
                      </span>
                    ))}
                  </td>
                  <td>
                    <button
                      className="feedback-delete-btn"
                      onClick={() => deleteFeedback(feedback._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
