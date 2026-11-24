import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  HeartPulse,
  Printer,
  Edit3,
  Phone,
  AlertTriangle,
  User,
  Calendar,
  Activity,
  CheckCircle2,
  X,
  Droplet,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import QRCodePass from "./QRCodePass";
import "./HealthCard.css";

const DEFAULT_CARD_DATA = {
  fullName: "Sarah Jenkins",
  memberId: "MB-2026-89412",
  bloodGroup: "O+ (Rh Positive)",
  dob: "1994-06-18",
  gender: "Female",
  emergencyContact: "+91 98765 43210 (Spouse)",
  allergies: "Penicillin, Dust Mites, Shellfish",
  chronicConditions: "Mild Seasonal Asthma",
  primaryClinic: "MediBook Central Clinic, Indiranagar, Bengaluru",
  issueDate: "2026-01-10",
  validThru: "2031-01-10",
};

export default function HealthCard() {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [cardData, setCardData] = useState(() => {
    try {
      const saved = localStorage.getItem("medibook_health_card");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      ...DEFAULT_CARD_DATA,
      fullName: user?.fullName || (user?.email ? user.email.split("@")[0] : DEFAULT_CARD_DATA.fullName),
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...cardData });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user?.fullName && cardData.fullName === DEFAULT_CARD_DATA.fullName) {
      setCardData((prev) => ({ ...prev, fullName: user.fullName }));
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    setCardData({ ...formData });
    try {
      localStorage.setItem("medibook_health_card", JSON.stringify(formData));
    } catch {}
    setIsEditing(false);
    setSuccessMsg(language === "kn" ? "ಆರೋಗ್ಯ ಕಾರ್ಡ್ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!" : language === "hi" ? "हेल्थ कार्ड विवरण सफलतापूर्वक अपडेट किया गया!" : "Health Card details updated successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="health-card-container">
      {/* Top Banner & Action Bar */}
      <div className="health-card-top-bar no-print">
        <div>
          <div className="health-card-badge">
            <ShieldCheck size={15} />
            <span>{t("hospitalNetworkBadge")}</span>
          </div>
          <h2>{t("healthCardTitle")}</h2>
          <p>{t("healthCardSub")}</p>
        </div>

        <div className="health-card-actions">
          <button
            type="button"
            onClick={() => {
              setFormData({ ...cardData });
              setIsEditing(true);
            }}
            className="card-action-btn edit-btn"
          >
            <Edit3 size={15} />
            <span>{t("editHealthCard")}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="card-action-btn print-btn"
          >
            <Printer size={15} />
            <span>{t("downloadCardPdf")}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="card-success-alert no-print">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Physical / Digital Wallet Card Presentation */}
      <div className="health-card-visual-wrapper">
        <div className="wallet-health-card" id="printable-health-card">
          {/* Card Top Header */}
          <div className="card-header-row">
            <div className="card-brand-group">
              <div className="card-logo-icon">
                <HeartPulse size={24} color="#ffffff" />
              </div>
              <div>
                <h3 className="card-org-name">MediBook Digital Health Pass</h3>
                <span className="card-sub-accred">Government Health Registry • NABH Level 1</span>
              </div>
            </div>

            <div className="card-chip-hologram">
              <div className="sim-chip"></div>
              <span className="secure-badge">ENCRYPTED ID</span>
            </div>
          </div>

          {/* Card Main Body */}
          <div className="card-body-row">
            <div className="card-patient-photo-col">
              <div className="patient-avatar-box">
                <span className="avatar-emoji">👤</span>
              </div>
              <span className="card-member-id">{cardData.memberId}</span>
              <span className="card-validity">Valid Thru: {cardData.validThru}</span>
            </div>

            <div className="card-info-col">
              <div className="patient-name-banner">
                <h4>{cardData.fullName}</h4>
                <div className="blood-group-tag">
                  <Droplet size={13} />
                  <strong>{cardData.bloodGroup}</strong>
                </div>
              </div>

              <div className="card-grid-meta">
                <div className="meta-box">
                  <span className="meta-lbl">{t("dob")} / {t("gender")}</span>
                  <span className="meta-val">{cardData.dob} • {cardData.gender}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-lbl">{t("emergencyContact")}</span>
                  <span className="meta-val highlight-phone">
                    <Phone size={11} /> {cardData.emergencyContact}
                  </span>
                </div>
                <div className="meta-box full">
                  <span className="meta-lbl">{t("allergies")}</span>
                  <span className="meta-val alert-tag">
                    <AlertTriangle size={11} /> {cardData.allergies}
                  </span>
                </div>
                <div className="meta-box full">
                  <span className="meta-lbl">{t("chronicConditions")}</span>
                  <span className="meta-val">{cardData.chronicConditions}</span>
                </div>
              </div>
            </div>

            {/* Embedded Fast-Track QR Pass */}
            <div className="card-qr-col">
              <div className="qr-box-mini">
                <QRCodePass
                  referenceCode={cardData.memberId}
                  patientName={cardData.fullName}
                  doctorName="Fast-Track Triage Desk"
                  date="Permanent ID"
                  time="24/7 Access"
                  hospital={cardData.primaryClinic}
                  size={95}
                />
              </div>
              <span className="qr-sub-text">Scan for Hospital Fast-Track Triage</span>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="card-footer-row">
            <span>🏥 {cardData.primaryClinic}</span>
            <span className="emergency-toll-free">Emergency: <strong>112 / +91 98765 43210</strong></span>
          </div>
        </div>
      </div>

      {/* Edit Health Card Modal */}
      {isEditing && (
        <div className="modal-overlay-card" onClick={() => setIsEditing(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h3>{t("editHealthCard")}</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="close-modal-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="card-edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t("patientName")}</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t("bloodGroup")}</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="O+ (Rh Positive)">O+ (Rh Positive)</option>
                    <option value="A+ (Rh Positive)">A+ (Rh Positive)</option>
                    <option value="B+ (Rh Positive)">B+ (Rh Positive)</option>
                    <option value="AB+ (Rh Positive)">AB+ (Rh Positive)</option>
                    <option value="O- (Rh Negative)">O- (Rh Negative)</option>
                    <option value="A- (Rh Negative)">A- (Rh Negative)</option>
                    <option value="B- (Rh Negative)">B- (Rh Negative)</option>
                    <option value="AB- (Rh Negative)">AB- (Rh Negative)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("dob")}</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t("gender")}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group full">
                <label>{t("emergencyContact")}</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210 (Relation)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label>{t("allergies")}</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Pollen, Peanuts..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label>{t("chronicConditions")}</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Type 2 Diabetes, None..."
                  value={formData.chronicConditions}
                  onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="cancel-modal-btn"
                >
                  {t("cancelBtn")}
                </button>
                <button type="submit" className="save-modal-btn">
                  {t("saveVitals")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
