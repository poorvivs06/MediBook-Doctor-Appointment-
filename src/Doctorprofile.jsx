import { useParams, useSearchParams, Link } from "react-router-dom";
import { doctors, getDoctorById } from "./doctorsData";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import Navbar from "./Navbar";
import "./Doctorprofile.css";

function DoctorProfile() {
  const { language, t } = useLanguage();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const doctorId = id || searchParams.get("id") || (doctors[0] ? doctors[0].id : null);
  const doctor = getDoctorById(doctorId, language);

  if (!doctor) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="not-found-card" style={{ maxWidth: "500px", margin: "60px auto", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🩺</div>
          <h2>{t("doctorNotFound")}</h2>
          <p>The doctor profile you are trying to view does not exist or has been relocated.</p>
          <Link to="/doctors" className="appointment-button" style={{ display: "inline-flex", marginTop: "16px" }}>
            <ArrowLeft size={16} />
            <span>{t("backToDoctors")}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-card">
        <div className="profile-image" aria-label={`Photo of ${doctor.name}`}>
          {doctor.photo}
        </div>

        <div className="profile-details">
          <p className="profile-title">{t("doctorProfile")}</p>

          <h1>{doctor.name}</h1>
          <h3>{doctor.specialty}</h3>

          <p>{doctor.about}</p>

          <div className="profile-info">
            <div>
              <strong>⭐ {doctor.rating}</strong>
              <span>{t("rating")}</span>
            </div>

            <div>
              <strong>{doctor.experience}</strong>
              <span>{t("clinicalExperience")}</span>
            </div>

            <div>
              <strong>{doctor.fee}</strong>
              <span>{t("consultationFee")}</span>
            </div>
          </div>

          <div className="profile-extra-section">
            <div className="profile-extra-row">
              <span className="profile-extra-label">{t("qualifications")}</span>
              <span className="profile-extra-val">{doctor.qualifications}</span>
            </div>

            <div className="profile-extra-row">
              <span className="profile-extra-label">{t("clinicHospital")}</span>
              <span className="profile-extra-val">{doctor.hospital}</span>
            </div>

            <div className="profile-extra-row">
              <span className="profile-extra-label">{t("weeklyHours")}</span>
              <span className="profile-extra-val">{doctor.availability}</span>
            </div>

            {doctor.availableSlots && doctor.availableSlots.length > 0 && (
              <div className="profile-extra-row">
                <span className="profile-extra-label">{t("availableSlots")}</span>
                <div className="slots-chips">
                  {doctor.availableSlots.map((slot, idx) => (
                    <span key={idx} className="slot-chip">{slot}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="profile-actions">
            <Link
              to={`/appointment?doctor=${doctor.id}`}
              className="appointment-button"
            >
              <span>{t("bookAppointment")}</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/doctors" className="back-link">
              ← {t("backToDoctors")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
