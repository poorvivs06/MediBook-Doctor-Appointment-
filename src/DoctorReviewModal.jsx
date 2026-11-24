import React, { useState } from "react";
import { Star, X, CheckCircle, ThumbsUp } from "lucide-react";
import "./DoctorReviewModal.css";

const COMPLIMENT_TAGS = [
  "🩺 Highly Knowledgeable",
  "🤝 Friendly & Caring",
  "👂 Listened Patiently",
  "⚡ Minimal Wait Time",
  "🏥 Spotless & Clean Clinic",
  "💡 Clear Treatment Plan",
  "💊 Helpful Prescription",
];

export default function DoctorReviewModal({
  appointment,
  onClose,
  onSubmitSuccess,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(["🩺 Highly Knowledgeable", "🤝 Friendly & Caring"]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const reviewObj = {
      id: `rev-${Date.now()}`,
      appointmentRef: appointment?.referenceCode || appointment?.reference_code,
      doctorId: appointment?.doctorId || appointment?.doctor_id,
      doctorName: appointment?.doctorName || appointment?.doctor_name,
      patientName: appointment?.patientName || appointment?.patient_name || "Patient",
      rating,
      tags: selectedTags,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem("medibook_doctor_reviews") || "[]");
      stored.unshift(reviewObj);
      localStorage.setItem("medibook_doctor_reviews", JSON.stringify(stored));
    } catch (err) {
      console.error("Failed to store review:", err);
    }

    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitSuccess) onSubmitSuccess(reviewObj);
      onClose();
    }, 1600);
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <div className="review-header-title">
            <span style={{ fontSize: "20px" }}>⭐</span>
            <h3>Rate Your Medical Consultation</h3>
          </div>
          <button type="button" onClick={onClose} className="review-close-btn" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="review-success-view">
            <CheckCircle size={48} color="#10b981" />
            <h3>Thank You for Your Feedback!</h3>
            <p>Your review helps other patients and supports {appointment?.doctorName || "your doctor"}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="review-form">
            <div className="review-doctor-banner">
              <span className="doc-avatar">👨‍⚕️</span>
              <div>
                <strong>{appointment?.doctorName || "Doctor"}</strong>
                <span>{appointment?.doctorSpecialty || "Specialist"} • {appointment?.doctorHospital || "MediBook"}</span>
              </div>
            </div>

            {/* Star Rating Selector */}
            <div className="stars-picker-group">
              <span className="picker-label">How was your overall consultation?</span>
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    aria-label={`${star} Stars`}
                  >
                    <Star
                      size={28}
                      fill={(hoverRating || rating) >= star ? "#f59e0b" : "none"}
                      color={(hoverRating || rating) >= star ? "#f59e0b" : "#cbd5e1"}
                    />
                  </button>
                ))}
              </div>
              <span className="rating-desc">
                {rating === 5 && "Excellent (5.0 / 5) ⭐⭐⭐⭐⭐"}
                {rating === 4 && "Very Good (4.0 / 5) ⭐⭐⭐⭐"}
                {rating === 3 && "Good (3.0 / 5) ⭐⭐⭐"}
                {rating === 2 && "Fair (2.0 / 5) ⭐⭐"}
                {rating === 1 && "Poor (1.0 / 5) ⭐"}
              </span>
            </div>

            {/* Compliment Tags */}
            <div className="compliments-group">
              <span className="picker-label">Select positive highlights:</span>
              <div className="compliment-tags-row">
                {COMPLIMENT_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`compliment-chip ${selectedTags.includes(tag) ? "selected" : ""}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Written Comment */}
            <div className="comment-group">
              <label htmlFor="review-comment">Share any comments (optional):</label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Doctor was very patient and explained the prescription thoroughly..."
                rows={3}
              />
            </div>

            <button type="submit" className="submit-review-btn">
              Submit Doctor Review ⭐
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
