import { useState, useEffect } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { doctors, getDoctorById } from "./doctorsData";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { bookAppointment } from "./supabase";
import Navbar from "./Navbar";
import MedicalSlipModal from "./MedicalSlipModal";
import DoctorDoll from "./DoctorDoll";
import QRCodePass from "./QRCodePass";
import TelehealthRoom from "./TelehealthRoom";
import DoctorReviewModal from "./DoctorReviewModal";
import {
  ArrowRight,
  Database,
  Printer,
  Video,
  Calendar,
  Share2,
  Star,
  Sparkles,
} from "lucide-react";
import "./Appointment.css";

function getGoogleCalendarUrl({ doctorName, appointmentDate, appointmentTime, hospital, referenceCode }) {
  const cleanDate = (appointmentDate || "").replace(/-/g, "");
  const timeNum = parseInt(appointmentTime || "10", 10);
  const isPM = (appointmentTime || "").includes("PM") && timeNum < 12;
  const startHour = (timeNum + (isPM ? 12 : 0)).toString().padStart(2, "0");
  const endHour = (timeNum + (isPM ? 12 : 0) + 1).toString().padStart(2, "0");
  const dates = `${cleanDate}T${startHour}0000Z/${cleanDate}T${endHour}0000Z`;

  const title = encodeURIComponent(`MediBook Consultation: ${doctorName}`);
  const details = encodeURIComponent(
    `MediBook Healthcare Consultation\nDoctor: ${doctorName}\nBooking Reference: ${referenceCode}\nClinic: ${hospital}\nPlease arrive 10 minutes prior.`
  );
  const location = encodeURIComponent(hospital || "MediBook Clinic");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

function getWhatsAppShareUrl({ doctorName, appointmentDate, appointmentTime, hospital, referenceCode, consultationType }) {
  const modeText = consultationType === "video" ? "📹 Virtual Video Call (Telehealth)" : "🏥 In-Clinic Visit";
  const msg = `🏥 *MediBook Appointment Confirmed!*\n\n• *Doctor:* ${doctorName}\n• *Date & Time:* ${appointmentDate} at ${appointmentTime}\n• *Consultation Mode:* ${modeText}\n• *Location:* ${hospital}\n• *Reference Code:* ${referenceCode}\n\n_Keep this as your official appointment confirmation pass._`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

function Appointment() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isConfigured } = useAuth();
  const { t, language } = useLanguage();

  // Determine selected doctor from URL param or query param (?doctor=poorvi)
  const doctorQuery = id || searchParams.get("doctor") || (doctors[0] ? doctors[0].id : "poorvi");
  const selectedDoctor = getDoctorById(doctorQuery, language) || doctors[0];

  const todayDate = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    reason: "",
    consultationType: "in-clinic", // "in-clinic" | "video"
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [showSlip, setShowSlip] = useState(false);
  const [showTelehealth, setShowTelehealth] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPreviewTelehealth, setShowPreviewTelehealth] = useState(false);
  const [showPreviewQR, setShowPreviewQR] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAutoFillDemo = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString("en-CA");

    setFormData({
      patientName: user?.fullName || "Sarah Jenkins",
      email: user?.email || "sarah.jenkins@example.com",
      phone: "+91 98765 43210",
      date: tomorrowStr,
      time: slotOptions[0] || "10:30 AM",
      reason: "Experiencing mild symptoms and requesting telehealth consultation.",
      consultationType: "video",
    });
  };

  // Auto-fill from authenticated user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        patientName: prev.patientName || user.fullName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Form validations
    if (!formData.patientName.trim()) {
      setErrorMsg("Please enter the patient's full name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMsg("Please enter a valid contact phone number.");
      return;
    }

    if (!formData.date) {
      setErrorMsg("Please select an appointment date.");
      return;
    }

    if (formData.date < todayDate) {
      setErrorMsg("Appointment date cannot be in the past. Please choose a future date.");
      return;
    }

    if (!formData.time) {
      setErrorMsg("Please select a preferred consultation time slot.");
      return;
    }

    if (!formData.reason.trim()) {
      setErrorMsg("Please specify the reason for your medical visit.");
      return;
    }

    setSubmitting(true);

    try {
      const record = await bookAppointment({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        doctorFee: selectedDoctor.fee,
        doctorHospital: selectedDoctor.hospital,
        patientName: formData.patientName.trim(),
        patientEmail: formData.email.trim(),
        patientPhone: formData.phone.trim(),
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        reason: formData.reason.trim(),
        consultationType: formData.consultationType,
        userId: user?.id || null,
      });

      setSubmittedData({
        referenceCode: record.reference_code || record.referenceCode,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        doctorFee: selectedDoctor.fee,
        doctorHospital: selectedDoctor.hospital,
        patientName: formData.patientName.trim(),
        patientEmail: formData.email.trim(),
        patientPhone: formData.phone.trim(),
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        reason: formData.reason.trim(),
        consultationType: formData.consultationType,
        provider: record.provider || (isConfigured ? "supabase" : "local"),
      });
    } catch (err) {
      setErrorMsg(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      patientName: user?.fullName || "",
      email: user?.email || "",
      phone: "",
      date: "",
      time: "",
      reason: "",
      consultationType: "in-clinic",
    });
  };

  // Time slot options (from doctor or standard slots)
  const slotOptions = selectedDoctor?.availableSlots || [
    "09:30 AM",
    "10:30 AM",
    "11:30 AM",
    "02:00 PM",
    "03:30 PM",
    "04:30 PM",
  ];

  return (
    <div className="appointment-page">
      <Navbar />

      <div className="appointment-container">
        <div className="appointment-header">
          <h1>{t("bookAppointmentTitle")}</h1>
          <p>{t("bookAppointmentSub")}</p>
        </div>

        {submittedData ? (
          /* Confirmation Success Card with Mascot, QR Pass & Calendar */
          <div className="confirmation-card">
            
            {/* Warm Hospital Thank-You Banner with Doctor Doll */}
            <div className="hospital-thankyou-card">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <DoctorDoll
                  size={105}
                  speechText="Your appointment is officially scheduled! 💖"
                  showBadge={true}
                  interactive={false}
                />
              </div>

              <div className="thankyou-hospital-badge">
                <span style={{ fontSize: "16px" }}>🏥</span>
                <span>{submittedData.doctorHospital || "MediBook Healthcare Network"}</span>
              </div>
              
              <h2>Thank You for Booking with Us! 💖</h2>
              <p className="thankyou-message">
                Dear <strong>{submittedData.patientName}</strong>, your consultation with <strong>{submittedData.doctorName}</strong> is confirmed. Our medical staff is looking forward to welcoming you.
              </p>

              {/* Telehealth Video Call CTA if selected */}
              {submittedData.consultationType === "video" && (
                <div className="telehealth-cta-banner">
                  <div className="telehealth-cta-info">
                    <Video size={20} color="#087f8c" />
                    <div>
                      <strong>Virtual Video Consultation Scheduled</strong>
                      <p>Your encrypted high-definition video consultation room is ready.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTelehealth(true)}
                    className="telehealth-join-btn"
                  >
                    <span>📹 Join Video Call Now</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              <div className="thankyou-notes-grid">
                <div className="thankyou-note-item">
                  <span className="note-emoji">🕒</span>
                  <div className="note-text">
                    <strong>Arrival Reminder:</strong> Please connect or arrive 10-15 minutes before <strong>{submittedData.appointmentTime}</strong> on <strong>{submittedData.appointmentDate}</strong>.
                  </div>
                </div>
                <div className="thankyou-note-item">
                  <span className="note-emoji">📋</span>
                  <div className="note-text">
                    <strong>Reception Check-in:</strong> Mention Reference Code <span className="ref-chip">{submittedData.referenceCode}</span> or scan the QR pass below.
                  </div>
                </div>
                <div className="thankyou-note-item">
                  <span className="note-emoji">📄</span>
                  <div className="note-text">
                    <strong>Official Medical Slip:</strong> Your digital clinical prescription slip is ready to print or save below.
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-Side: QR Pass & Summary Box */}
            <div className="confirmation-middle-layout">
              {/* QR Fast-Track Pass */}
              <div className="confirmation-qr-wrapper">
                <QRCodePass
                  referenceCode={submittedData.referenceCode}
                  patientName={submittedData.patientName}
                  doctorName={submittedData.doctorName}
                  date={submittedData.appointmentDate}
                  time={submittedData.appointmentTime}
                  hospital={submittedData.doctorHospital}
                  size={140}
                />
              </div>

              {/* Details Box */}
              <div className="confirmation-details-box">
                <div className="confirmation-row">
                  <span className="confirmation-label">Appointment Reference:</span>
                  <span className="confirmation-value" style={{ color: "#087f8c", fontFamily: "monospace", fontWeight: "700" }}>
                    {submittedData.referenceCode}
                  </span>
                </div>

                <div className="confirmation-row">
                  <span className="confirmation-label">Doctor:</span>
                  <span className="confirmation-value">
                    {submittedData.doctorName} ({submittedData.doctorSpecialty})
                  </span>
                </div>

                <div className="confirmation-row">
                  <span className="confirmation-label">Mode:</span>
                  <span className="confirmation-value">
                    {submittedData.consultationType === "video" ? "📹 Virtual Video Call" : "🏥 In-Clinic Hospital Visit"}
                  </span>
                </div>

                <div className="confirmation-row">
                  <span className="confirmation-label">Location:</span>
                  <span className="confirmation-value">{submittedData.doctorHospital}</span>
                </div>

                <div className="confirmation-row">
                  <span className="confirmation-label">Date & Time:</span>
                  <span className="confirmation-value">
                    {submittedData.appointmentDate} at {submittedData.appointmentTime}
                  </span>
                </div>

                <div className="confirmation-row">
                  <span className="confirmation-label">Fee:</span>
                  <span className="confirmation-value">{submittedData.doctorFee}</span>
                </div>
              </div>
            </div>

            {/* Trendy 1-Click Sync & Share Action Strip */}
            <div className="sync-share-strip">
              <a
                href={getGoogleCalendarUrl(submittedData)}
                target="_blank"
                rel="noopener noreferrer"
                className="sync-btn cal-btn"
              >
                <Calendar size={15} />
                <span>Add to Google Calendar</span>
              </a>

              <a
                href={getWhatsAppShareUrl(submittedData)}
                target="_blank"
                rel="noopener noreferrer"
                className="sync-btn wa-btn"
              >
                <Share2 size={15} />
                <span>Send to WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="sync-btn review-btn"
              >
                <Star size={15} />
                <span>Rate Doctor</span>
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="confirmation-actions">
              <button
                type="button"
                onClick={() => setShowSlip(true)}
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#087f8c",
                }}
              >
                <Printer size={16} />
                <span>Download Medical Slip (PDF)</span>
              </button>

              <Link to="/my-appointments" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span>View My Appointments</span>
                <ArrowRight size={16} />
              </Link>

              <button type="button" onClick={handleReset} className="btn-secondary">
                Book Another
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Selected Doctor Spotlight Banner */}
            {selectedDoctor && (
              <div className="selected-doctor-banner">
                <div className="doctor-avatar-circle">
                  {selectedDoctor.photo}
                </div>
                <div className="doctor-banner-details">
                  <span className="doctor-banner-tag">
                    {language === "kn" ? "ಆಯ್ಕೆಮಾಡಿದ ವೈದ್ಯಕೀಯ ತಜ್ಞರು" : language === "hi" ? "चयनित चिकित्सा विशेषज्ञ" : "Selected Healthcare Specialist"}
                  </span>
                  <h2>{selectedDoctor.name}</h2>
                  <p>{selectedDoctor.specialty} • {selectedDoctor.experience}</p>
                  <p className="doctor-banner-hospital">🏥 {selectedDoctor.hospital}</p>
                </div>
                <div className="doctor-banner-fee">
                  <span className="fee-label">{t("consultationFee")}</span>
                  <span className="fee-amount">{selectedDoctor.fee}</span>
                </div>
              </div>
            )}

            <div className="appointment-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                <h2 style={{ margin: 0 }}>
                  {language === "kn" ? "ರೋಗಿಯ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿವರಗಳು" : language === "hi" ? "मरीज बुकिंग विवरण" : "Patient Booking Details"}
                </h2>
                
                {/* 1-Click Feature Previews */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setShowPreviewTelehealth(true)}
                    style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "1px solid #7dd3fc",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Video size={13} />
                    <span>Live Video Call Room Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreviewQR(true)}
                    style={{
                      background: "#f1f5f9",
                      color: "#1e293b",
                      border: "1px solid #cbd5e1",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>📱 QR Pass Preview</span>
                  </button>
                </div>
              </div>

              {/* Instant Auto-Fill for Easy Testing */}
              <div style={{
                background: "#f0fdfa",
                border: "1.5px dashed #087f8c",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px"
              }}>
                <div style={{ fontSize: "12px", color: "#334155" }}>
                  <strong style={{ color: "#087f8c" }}>⚡ Quick 1-Click Test:</strong> Auto-fill form with <strong>Video Call</strong> to see all features:
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  style={{
                    background: "#087f8c",
                    color: "#ffffff",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  ⚡ Auto-Fill Demo Form
                </button>
              </div>

              {errorMsg && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontSize: "14px",
                  }}
                  role="alert"
                >
                  {errorMsg}
                </div>
              )}

              {/* Consultation Mode Selector */}
              <div className="consultation-mode-card">
                <label className="mode-title-label">{t("consultationMode")}</label>
                <div className="consultation-toggle-row">
                  <button
                    type="button"
                    className={`mode-selector-btn ${formData.consultationType === "in-clinic" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, consultationType: "in-clinic" })}
                  >
                    <span className="mode-btn-icon">🏥</span>
                    <div className="mode-btn-content">
                      <strong>{t("inClinicVisit")}</strong>
                      <span>{t("inClinicSub")}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`mode-selector-btn ${formData.consultationType === "video" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, consultationType: "video" })}
                  >
                    <span className="mode-btn-icon">📹</span>
                    <div className="mode-btn-content">
                      <strong>{t("videoCall")}</strong>
                      <span>{t("videoCallSub")}</span>
                    </div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  <div className="apt-form-group">
                    <label htmlFor="patientName">{t("patientName")}</label>
                    <input
                      id="patientName"
                      name="patientName"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.patientName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="apt-form-group">
                    <label htmlFor="email">{t("emailAddress")}</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="apt-form-group">
                    <label htmlFor="phone">{t("phoneNum")}</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="apt-form-group">
                    <label htmlFor="date">{t("appointmentDate")}</label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      min={todayDate}
                      required
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="apt-form-group full-width">
                    <label htmlFor="time">{t("preferredSlot")}</label>
                    <select
                      id="time"
                      name="time"
                      required
                      value={formData.time}
                      onChange={handleChange}
                    >
                      <option value="">-- Choose an available time slot --</option>
                      {slotOptions.map((slot, index) => (
                        <option key={index} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="apt-form-group full-width">
                    <label htmlFor="reason">{t("reasonForVisit")}</label>
                    <textarea
                      id="reason"
                      name="reason"
                      required
                      placeholder="Briefly describe your symptoms or reason for this consultation..."
                      value={formData.reason}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="apt-submit-btn"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "wait" : "pointer" }}
                >
                  {submitting ? "Booking Appointment..." : t("confirmBookingBtn")}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Official Downloadable/Printable Medical Slip */}
      {showSlip && submittedData && (
        <MedicalSlipModal
          appointment={submittedData}
          onClose={() => setShowSlip(false)}
        />
      )}

      {/* Telehealth Live Video Consultation Room */}
      {showTelehealth && submittedData && (
        <TelehealthRoom
          appointment={submittedData}
          onClose={() => setShowTelehealth(false)}
          onCompleteConsultation={() => {
            setShowTelehealth(false);
            setShowReviewModal(true);
          }}
        />
      )}

      {/* Doctor Rating & Review Modal */}
      {showReviewModal && submittedData && (
        <DoctorReviewModal
          appointment={submittedData}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {/* Direct Previews for Instant Testing Without Form Submission */}
      {showPreviewTelehealth && (
        <TelehealthRoom
          appointment={{
            doctorName: selectedDoctor.name,
            doctorSpecialty: selectedDoctor.specialty,
            doctorHospital: selectedDoctor.hospital,
            patientName: user?.fullName || "Patient",
            referenceCode: "MED-PREVIEW",
            reason: "Telehealth Consultation Preview Demo",
          }}
          onClose={() => setShowPreviewTelehealth(false)}
        />
      )}

      {showPreviewQR && (
        <div className="modal-overlay-center" onClick={() => setShowPreviewQR(false)}>
          <div className="modal-card-center" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#172b4d" }}>Hospital Check-in QR Pass</h3>
              <button type="button" onClick={() => setShowPreviewQR(false)} className="close-btn">
                ✕
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <QRCodePass
                referenceCode="MED-8842"
                patientName={user?.fullName || "Patient"}
                doctorName={selectedDoctor.name}
                date={todayDate}
                time="10:30 AM"
                hospital={selectedDoctor.hospital}
                size={160}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointment;
