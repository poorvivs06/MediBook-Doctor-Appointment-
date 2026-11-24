import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { getDoctorById } from "./doctorsData";
import { getPatientAppointments, cancelAppointment } from "./supabase";
import Navbar from "./Navbar";
import MedicalSlipModal from "./MedicalSlipModal";
import QRCodePass from "./QRCodePass";
import TelehealthRoom from "./TelehealthRoom";
import DoctorReviewModal from "./DoctorReviewModal";
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  ArrowRight,
  Printer,
  Video,
  Share2,
  Star,
  QrCode,
  Pill,
  Check,
  Building,
  FlaskConical,
  CreditCard,
  Activity,
} from "lucide-react";
import "./MyAppointments.css";

function getGoogleCalendarUrl(apt) {
  const doctorName = apt.doctor_name || apt.doctorName;
  const date = (apt.appointment_date || apt.appointmentDate || "").replace(/-/g, "");
  const timeStr = apt.appointment_time || apt.appointmentTime || "10:00 AM";
  const hospital = apt.doctor_hospital || apt.doctorHospital || "MediBook Clinic";
  const ref = apt.reference_code || apt.referenceCode;

  const timeNum = parseInt(timeStr, 10);
  const isPM = timeStr.includes("PM") && timeNum < 12;
  const startHour = (timeNum + (isPM ? 12 : 0)).toString().padStart(2, "0");
  const endHour = (timeNum + (isPM ? 12 : 0) + 1).toString().padStart(2, "0");
  const dates = `${date}T${startHour}0000Z/${date}T${endHour}0000Z`;

  const title = encodeURIComponent(`MediBook: ${doctorName}`);
  const details = encodeURIComponent(
    `Medical Consultation with ${doctorName}\nReference: ${ref}\nLocation: ${hospital}`
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${encodeURIComponent(hospital)}`;
}

function getWhatsAppShareUrl(apt) {
  const doctorName = apt.doctor_name || apt.doctorName;
  const date = apt.appointment_date || apt.appointmentDate;
  const time = apt.appointment_time || apt.appointmentTime;
  const hospital = apt.doctor_hospital || apt.doctorHospital;
  const ref = apt.reference_code || apt.referenceCode;
  const isVideo = (apt.consultation_type || apt.consultationType) === "video";

  const msg = `🏥 *MediBook Appointment Confirmation*\n\n• *Doctor:* ${doctorName}\n• *Date & Time:* ${date} at ${time}\n• *Mode:* ${isVideo ? "📹 Virtual Video Call" : "🏥 In-Clinic Visit"}\n• *Location:* ${hospital}\n• *Reference Code:* ${ref}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

export default function MyAppointments() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState(user?.email || "");
  const [actionMsg, setActionMsg] = useState("");

  // Redirect legacy ?tab= deep links to their dedicated separate pages
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "lab") navigate("/lab-tests", { replace: true });
    else if (tab === "vitals") navigate("/vitals", { replace: true });
    else if (tab === "healthcard") navigate("/health-card", { replace: true });
    else if (tab === "medicines") navigate("/medicines", { replace: true });
  }, [searchParams, navigate]);

  // Active modals
  const [activeSlipAppointment, setActiveSlipAppointment] = useState(null);
  const [activeQRAppointment, setActiveQRAppointment] = useState(null);
  const [activeTelehealthApt, setActiveTelehealthApt] = useState(null);
  const [activeReviewApt, setActiveReviewApt] = useState(null);

  // Check-in tracking state (persisted locally)
  const [checkedInIds, setCheckedInIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("medibook_checked_in_apts") || "[]");
    } catch {
      return [];
    }
  });

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const emailToSearch = user?.email || filterEmail;
      const data = await getPatientAppointments(emailToSearch, user?.id);
      setAppointments(data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setFilterEmail(user.email);
    }
    loadAppointments();
  }, [user]);

  const handleCancel = async (apt) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel your appointment with ${apt.doctor_name || apt.doctorName} on ${apt.appointment_date || apt.appointmentDate}?`
    );
    if (!confirmCancel) return;

    try {
      await cancelAppointment(apt.id, apt.reference_code || apt.referenceCode);
      setActionMsg("Appointment successfully cancelled.");
      setTimeout(() => setActionMsg(""), 4000);
      await loadAppointments();
    } catch (err) {
      alert("Failed to cancel appointment: " + err.message);
    }
  };

  const handleCheckIn = (aptId) => {
    const updated = [...checkedInIds, aptId];
    setCheckedInIds(updated);
    try {
      localStorage.setItem("medibook_checked_in_apts", JSON.stringify(updated));
    } catch {}
    setActionMsg("You have successfully checked-in at the clinic! Your token is queued.");
    setTimeout(() => setActionMsg(""), 4000);
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    loadAppointments();
  };

  return (
    <div className="my-appointments-page">
      <Navbar />

      <main className="appointments-container">
        <header className="page-header">
          <div>
            <span className="sub-badge">{t("patientHealthcarePortal")}</span>
            <h1>{t("patientDashboard")}</h1>
            <p>{t("patientDashboardSub")}</p>
          </div>

          <Link to="/doctors" className="book-new-btn">
            + {t("bookAppointment")}
          </Link>
        </header>

        {/* Dedicated Portals Quick-Navigation Strip */}
        <div className="separate-portals-strip">
          <Link to="/lab-tests" className="portal-jump-card labs">
            <div className="jump-icon labs"><FlaskConical size={18} /></div>
            <div className="jump-meta">
              <strong>{t("labTests")}</strong>
              <span>NABL Pathology Reports</span>
            </div>
            <ArrowRight size={15} className="jump-arrow" />
          </Link>

          <Link to="/vitals" className="portal-jump-card vitals">
            <div className="jump-icon vitals"><Activity size={18} /></div>
            <div className="jump-meta">
              <strong>{t("vitalsNav")}</strong>
              <span>BP, Glucose &amp; SpO2</span>
            </div>
            <ArrowRight size={15} className="jump-arrow" />
          </Link>

          <Link to="/medicines" className="portal-jump-card meds">
            <div className="jump-icon meds"><Pill size={18} /></div>
            <div className="jump-meta">
              <strong>{t("medicinesNav")}</strong>
              <span>Daily Pill Reminders</span>
            </div>
            <ArrowRight size={15} className="jump-arrow" />
          </Link>

          <Link to="/health-card" className="portal-jump-card card">
            <div className="jump-icon card"><CreditCard size={18} /></div>
            <div className="jump-meta">
              <strong>{t("healthCardNav")}</strong>
              <span>Digital Medical Pass</span>
            </div>
            <ArrowRight size={15} className="jump-arrow" />
          </Link>
        </div>

        {actionMsg && (
          <div className="success-banner">
            <CheckCircle size={18} />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Scheduled Consultations */}
        <>
            {!user && (
              <div className="guest-lookup-card">
                <div className="guest-lookup-header">
                  <AlertCircle size={20} className="info-icon" />
                  <div>
                    <strong>Looking up bookings as a guest?</strong>
                    <p>
                      Enter the email address you used when booking, or{" "}
                      <Link to="/login">log in to your MediBook account</Link> to
                      automatically link your appointments.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleLookupSubmit} className="lookup-form">
                  <input
                    type="email"
                    placeholder="Enter booking email address..."
                    value={filterEmail}
                    onChange={(e) => setFilterEmail(e.target.value)}
                  />
                  <button type="submit">Search Bookings</button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your medical appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="empty-appointments">
                <div className="empty-icon">📅</div>
                <h3>No Scheduled Appointments Yet</h3>
                <p>
                  You haven't scheduled an appointment yet. You can book a real appointment, or click below to load demo consultations to test the new features:
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", margin: "16px 0" }}>
                  <Link to="/doctors" className="book-first-btn">
                    Browse Doctors & Book Now
                    <ArrowRight size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAppointments([
                        {
                          id: "demo-apt-1",
                          reference_code: "MED-4821",
                          doctor_name: "Dr. Suresh",
                          doctor_specialty: "Cardiologist (10 Yrs Exp)",
                          doctor_hospital: "MediBook Heart & Vascular Care Center",
                          appointment_date: "2026-11-25",
                          appointment_time: "10:30 AM",
                          doctor_fee: "₹700",
                          patient_name: user?.fullName || "Patient",
                          consultation_type: "video",
                          status: "confirmed",
                        },
                        {
                          id: "demo-apt-2",
                          reference_code: "MED-9102",
                          doctor_name: "Poorvi",
                          doctor_specialty: "Dermatologist (7 Yrs Exp)",
                          doctor_hospital: "MediBook Skin & Aesthetic Care Clinic",
                          appointment_date: "2026-11-26",
                          appointment_time: "02:00 PM",
                          doctor_fee: "₹500",
                          patient_name: user?.fullName || "Patient",
                          consultation_type: "in-clinic",
                          status: "confirmed",
                        },
                      ]);
                    }}
                    style={{
                      background: "#087f8c",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>⚡ Load Demo Consultations (Test Video, QR & Queue)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="appointments-grid">
                {appointments.map((apt) => {
                  const rawDoctorName = apt.doctor_name || apt.doctorName;
                  const matchedDoc = getDoctorById(rawDoctorName, language);
                  const doctorName = matchedDoc?.name || rawDoctorName;
                  const doctorSpecialty =
                    matchedDoc?.specialty || apt.doctor_specialty || apt.doctorSpecialty;
                  const doctorHospital =
                    matchedDoc?.hospital || apt.doctor_hospital || apt.doctorHospital || "MediBook Partner Clinic";
                  const date = apt.appointment_date || apt.appointmentDate;
                  const time = apt.appointment_time || apt.appointmentTime;
                  const fee = apt.doctor_fee || apt.doctorFee;
                  const ref = apt.reference_code || apt.referenceCode || apt.id;
                  const patientName = apt.patient_name || apt.patientName;
                  const status = (apt.status || "confirmed").toLowerCase();
                  const isCancelled = status === "cancelled";
                  const isVideo = (apt.consultation_type || apt.consultationType) === "video";
                  const isCheckedIn = checkedInIds.includes(apt.id || ref);

                  // Deterministic token number from reference
                  const tokenNum = ((ref.charCodeAt(ref.length - 1) + ref.charCodeAt(ref.length - 2)) % 25) + 5;
                  const servingToken = Math.max(1, tokenNum - 2);

                  return (
                    <div
                      key={apt.id || ref}
                      className={`appointment-card ${isCancelled ? "is-cancelled" : ""}`}
                    >
                      <div className="card-top">
                        <div className="doctor-meta">
                          <span className="doctor-avatar">👨‍⚕️</span>
                          <div>
                            <h3>{doctorName}</h3>
                            <span className="specialty-tag">{doctorSpecialty}</span>
                          </div>
                        </div>

                        <div className="status-pill-group">
                          <span className={`status-badge status-${status}`}>
                            {status === "confirmed" && <CheckCircle size={13} />}
                            {status === "cancelled" && <XCircle size={13} />}
                            {status === "confirmed" ? t("confirmed") : status === "cancelled" ? t("cancelled") : t("pending")}
                          </span>
                          <span className={`mode-badge ${isVideo ? "video" : "clinic"}`}>
                            {isVideo
                              ? (language === "kn" ? "📹 ವೀಡಿಯೊ ಕರೆ" : language === "hi" ? "📹 वीडियो कॉल" : "📹 Video Call")
                              : (language === "kn" ? "🏥 ಕ್ಲಿನಿಕ್ ಭೇಟಿ" : language === "hi" ? "🏥 क्लिनिक में" : "🏥 In-Clinic")}
                          </span>
                        </div>
                      </div>

                      {/* Live Queue & Token Tracker (for active appointments) */}
                      {!isCancelled && (
                        <div className="queue-tracker-box">
                          <div className="queue-token-row">
                            <div className="token-badge">
                              <span className="token-label">
                                {language === "kn" ? "ನಿಮ್ಮ ಟೋಕನ್" : language === "hi" ? "आपका टोकन" : "YOUR TOKEN"}
                              </span>
                              <strong>#{tokenNum}</strong>
                            </div>
                            <div className="queue-wait-meta">
                              <span className="queue-live-dot"></span>
                              <span>{t("currentlyServing")}: <strong>#{servingToken}</strong></span>
                              <span className="est-wait">{t("estWait")}: ~{Math.max(5, (tokenNum - servingToken) * 5)} mins</span>
                            </div>
                          </div>

                          {/* Progress Stepper */}
                          <div className="status-stepper">
                            <div className="step-point completed">
                              <div className="circle"><Check size={11} /></div>
                              <span>{t("stepBooked")}</span>
                            </div>
                            <div className={`step-line ${isCheckedIn ? "active" : ""}`}></div>
                            <div className={`step-point ${isCheckedIn ? "completed" : "pending"}`}>
                              <div className="circle">{isCheckedIn ? <Check size={11} /> : "2"}</div>
                              <span>{t("stepArrived")}</span>
                            </div>
                            <div className="step-line"></div>
                            <div className="step-point pending">
                              <div className="circle">3</div>
                              <span>{t("stepInDoctorCare")}</span>
                            </div>
                            <div className="step-line"></div>
                            <div className="step-point pending">
                              <div className="circle">4</div>
                              <span>{t("stepCompleted")}</span>
                            </div>
                          </div>

                          {!isCheckedIn && (
                            <button
                              type="button"
                              onClick={() => handleCheckIn(apt.id || ref)}
                              className="checkin-btn"
                            >
                              {t("iHaveArrived")}
                            </button>
                          )}
                        </div>
                      )}

                      <div className="card-details">
                        <div className="detail-item">
                          <Calendar size={16} className="detail-icon" />
                          <div>
                            <span className="label">{language === "kn" ? "ದಿನಾಂಕ" : language === "hi" ? "तारीख" : "Date"}</span>
                            <span className="val">{date}</span>
                          </div>
                        </div>

                        <div className="detail-item">
                          <Clock size={16} className="detail-icon" />
                          <div>
                            <span className="label">{language === "kn" ? "ಸಮಯ" : language === "hi" ? "समय" : "Time Slot"}</span>
                            <span className="val">{time}</span>
                          </div>
                        </div>

                        <div className="detail-item full-width">
                          <MapPin size={16} className="detail-icon" />
                          <div>
                            <span className="label">{language === "kn" ? "ಸ್ಥಳ" : language === "hi" ? "स्थान" : "Location"}</span>
                            <span className="val">{doctorHospital}</span>
                          </div>
                        </div>

                        <div className="detail-item full-width">
                          <User size={16} className="detail-icon" />
                          <div>
                            <span className="label">{t("patientName")}</span>
                            <span className="val">{patientName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Telehealth Video CTA if video consultation */}
                      {isVideo && !isCancelled && (
                        <div className="card-telehealth-banner">
                          <button
                            type="button"
                            onClick={() => setActiveTelehealthApt(apt)}
                            className="join-telehealth-card-btn"
                          >
                            <Video size={16} />
                            <span>{t("joinVideoCall")}</span>
                          </button>
                        </div>
                      )}

                      {/* Trendy Quick Actions: QR Pass, Google Calendar, WhatsApp, Review */}
                      <div className="card-quick-actions">
                        <button
                          type="button"
                          onClick={() => setActiveQRAppointment(apt)}
                          className="quick-act-btn qr"
                          title="Show Hospital Fast-Track QR Pass"
                        >
                          <QrCode size={13} />
                          <span>{language === "kn" ? "QR ಪಾಸ್" : language === "hi" ? "QR पास" : "QR Pass"}</span>
                        </button>

                        <a
                          href={getGoogleCalendarUrl(apt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="quick-act-btn cal"
                          title="Add to Google Calendar"
                        >
                          <Calendar size={13} />
                          <span>{language === "kn" ? "ಕ್ಯಾಲೆಂಡರ್" : language === "hi" ? "कैलेंडर" : "Calendar"}</span>
                        </a>

                        <a
                          href={getWhatsAppShareUrl(apt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="quick-act-btn wa"
                          title="Share on WhatsApp"
                        >
                          <Share2 size={13} />
                          <span>{language === "kn" ? "ವಾಟ್ಸಾಪ್" : language === "hi" ? "व्हाट्सएप" : "WhatsApp"}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setActiveReviewApt(apt)}
                          className="quick-act-btn star"
                          title="Rate Doctor"
                        >
                          <Star size={13} />
                          <span>{t("rateDoctor")}</span>
                        </button>
                      </div>

                      <div className="card-footer">
                        <div className="meta-left">
                          <span className="ref-code">Ref: {ref}</span>
                          <span className="fee-badge">{fee}</span>
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => setActiveSlipAppointment(apt)}
                            className="slip-btn"
                            title="Download or Print Medical Slip"
                          >
                            <Printer size={13} />
                            <span>{t("medicalSlipBtn")}</span>
                          </button>

                          {!isCancelled && (
                            <button
                              onClick={() => handleCancel(apt)}
                              className="cancel-btn"
                              title="Cancel this appointment"
                            >
                              {t("cancelBtn")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </>
      </main>

      {/* Official Downloadable/Printable Medical Slip Modal */}
      {activeSlipAppointment && (
        <MedicalSlipModal
          appointment={activeSlipAppointment}
          onClose={() => setActiveSlipAppointment(null)}
        />
      )}

      {/* Hospital QR Pass Modal */}
      {activeQRAppointment && (
        <div className="modal-overlay-center" onClick={() => setActiveQRAppointment(null)}>
          <div className="modal-card-center" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#172b4d" }}>Hospital Check-in QR Pass</h3>
              <button type="button" onClick={() => setActiveQRAppointment(null)} className="close-btn">
                ✕
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <QRCodePass
                referenceCode={activeQRAppointment.reference_code || activeQRAppointment.referenceCode}
                patientName={activeQRAppointment.patient_name || activeQRAppointment.patientName}
                doctorName={activeQRAppointment.doctor_name || activeQRAppointment.doctorName}
                date={activeQRAppointment.appointment_date || activeQRAppointment.appointmentDate}
                time={activeQRAppointment.appointment_time || activeQRAppointment.appointmentTime}
                hospital={activeQRAppointment.doctor_hospital || activeQRAppointment.doctorHospital}
                size={160}
              />
            </div>
          </div>
        </div>
      )}

      {/* Telehealth Live Consultation Room Modal */}
      {activeTelehealthApt && (
        <TelehealthRoom
          appointment={activeTelehealthApt}
          onClose={() => setActiveTelehealthApt(null)}
          onCompleteConsultation={(apt) => {
            setActiveTelehealthApt(null);
            setActiveReviewApt(apt);
          }}
        />
      )}

      {/* Doctor Rating & Review Modal */}
      {activeReviewApt && (
        <DoctorReviewModal
          appointment={activeReviewApt}
          onClose={() => setActiveReviewApt(null)}
          onSubmitSuccess={() => {
            setActionMsg("Thank you! Your doctor review has been saved.");
            setTimeout(() => setActionMsg(""), 3500);
          }}
        />
      )}
    </div>
  );
}
