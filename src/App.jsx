import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Doctors from "./Doctors";
import DoctorProfile from "./Doctorprofile";
import Appointment from "./Appointment";
import Login from "./login";
import Register from "./Register";
import MyAppointments from "./MyAppointments";
import Navbar from "./Navbar";
import SymptomChecker from "./SymptomChecker";
import LabReports from "./LabReports";
import HealthCard from "./HealthCard";
import VitalsTracker from "./VitalsTracker";
import { doctors as defaultDoctors, getDoctorById, getLocalizedDoctor } from "./doctorsData";
import { AuthProvider, useAuth } from "./AuthContext";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import {
  ArrowRight,
  Sparkles,
  X,
  CheckCircle,
  HeartPulse,
  Shield,
  Activity,
  CreditCard,
  Video,
  Search,
  Star,
  Clock,
  Calendar,
  Stethoscope,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  Award,
} from "lucide-react";
import "./App.css";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  // Dynamic time-based greeting calculation
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: t("goodMorning"), emoji: "🌅" };
    } else if (hour >= 12 && hour < 17) {
      return { text: t("goodAfternoon"), emoji: "☀️" };
    } else if (hour >= 17 && hour < 21) {
      return { text: t("goodEvening"), emoji: "🌆" };
    }
    return { text: t("welcome"), emoji: "🌙" };
  };

  const { text: timeText, emoji: timeEmoji } = getTimeGreeting();
  const displayName = user?.fullName || (user?.email ? user.email.split("@")[0] : null);

  const poorviDoc = getDoctorById("poorvi", language) || {};
  const sureshDoc = getDoctorById("dr-suresh", language) || {};
  const vaniDoc = getDoctorById("dr-vani", language) || {};
  const arjunDoc = getDoctorById("dr-arjun", language) || {};
  const snehaDoc = getDoctorById("dr-sneha", language) || {};
  const kiranDoc = getDoctorById("dr-kiran", language) || {};

  const featuredDoctors = [poorviDoc, sureshDoc, vaniDoc].filter(Boolean);

  // Interactive Mood & Symptom Quick Assessment
  const moodOptions = [
    {
      id: "skin",
      emoji: "🧴",
      label: t("skinRashes"),
      headline: language === "kn" ? "ತ್ವಚೆ ಮತ್ತು ಅಲರ್ಜಿ ತಜ್ಞರು 👩‍⚕️" : language === "hi" ? "त्वचा एवं एलर्जी विशेषज्ञ 👩‍⚕️" : "Dermatology & Skin Allergy 👩‍⚕️",
      advice: poorviDoc.about || "Poorvi specializes in advanced dermatology, acne treatments, eczema, and skin allergy care.",
      doctorName: poorviDoc.name || "Poorvi",
      specialty: `${poorviDoc.specialty} (${poorviDoc.experience})`,
      fee: poorviDoc.fee || "₹500",
      actionLabel: `${t("book")} - ${poorviDoc.name}`,
      actionLink: "/appointment?doctor=poorvi",
      profileLink: "/doctor-profile/poorvi",
    },
    {
      id: "heart",
      emoji: "❤️",
      label: t("heartBp"),
      headline: language === "kn" ? "ಹೃದಯ ಮತ್ತು ರಕ್ತದೊತ್ತಡದ ಆರೈಕೆ 👨‍⚕️" : language === "hi" ? "हृदय एवं रक्तचाप (BP) की देखभाल 👨‍⚕️" : "Cardiovascular & BP health 👨‍⚕️",
      advice: sureshDoc.about || "Dr. Suresh is a senior cardiologist offering non-invasive cardiac care, BP management, and heart wellness.",
      doctorName: sureshDoc.name || "Dr. Suresh",
      specialty: `${sureshDoc.specialty} (${sureshDoc.experience})`,
      fee: sureshDoc.fee || "₹700",
      actionLabel: `${t("book")} - ${sureshDoc.name}`,
      actionLink: "/appointment?doctor=dr-suresh",
      profileLink: "/doctor-profile/dr-suresh",
    },
    {
      id: "child",
      emoji: "👶",
      label: t("childFever"),
      headline: language === "kn" ? "ಮಕ್ಕಳ ಆರೋಗ್ಯ ಮತ್ತು ಲಸಿಕೆಗಳು 👩‍⚕️" : language === "hi" ? "शिशु एवं बाल स्वास्थ्य परामर्श 👩‍⚕️" : "Pediatric care & childhood wellness 👩‍⚕️",
      advice: vaniDoc.about || "Dr. Vani provides compassionate newborn care, vaccinations, and pediatric consultations.",
      doctorName: vaniDoc.name || "Dr. Vani",
      specialty: `${vaniDoc.specialty} (${vaniDoc.experience})`,
      fee: vaniDoc.fee || "₹400",
      actionLabel: `${t("book")} - ${vaniDoc.name}`,
      actionLink: "/appointment?doctor=dr-vani",
      profileLink: "/doctor-profile/dr-vani",
    },
    {
      id: "head",
      emoji: "🧠",
      label: t("headacheNerve"),
      headline: language === "kn" ? "ತಲೆನೋವು ಮತ್ತು ನರರೋಗ ತಜ್ಞರು 👨‍⚕️" : language === "hi" ? "सिरदर्द एवं न्यूरोलॉजिकल परामर्श 👨‍⚕️" : "Migraines & nerve care 👨‍⚕️",
      advice: arjunDoc.about || "Dr. Arjun Mehta specializes in migraine treatment, cognitive health, and neurological consultations.",
      doctorName: arjunDoc.name || "Dr. Arjun Mehta",
      specialty: `${arjunDoc.specialty} (${arjunDoc.experience})`,
      fee: arjunDoc.fee || "₹600",
      actionLabel: `${t("book")} - ${arjunDoc.name}`,
      actionLink: "/appointment?doctor=dr-arjun",
      profileLink: "/doctor-profile/dr-arjun",
    },
    {
      id: "teeth",
      emoji: "🦷",
      label: t("toothPain"),
      headline: language === "kn" ? "ದಂತ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಹಲ್ಲಿನ ಆರೈಕೆ 👩‍⚕️" : language === "hi" ? "दंत एवं मौखिक स्वच्छता 👩‍⚕️" : "Dental & oral hygiene 👩‍⚕️",
      advice: snehaDoc.about || "Dr. Sneha Patel provides comprehensive toothache relief, cavity care, and dental cleanings.",
      doctorName: snehaDoc.name || "Dr. Sneha Patel",
      specialty: `${snehaDoc.specialty} (${snehaDoc.experience})`,
      fee: snehaDoc.fee || "₹350",
      actionLabel: `${t("book")} - ${snehaDoc.name}`,
      actionLink: "/appointment?doctor=dr-sneha",
      profileLink: "/doctor-profile/dr-sneha",
    },
    {
      id: "eyes",
      emoji: "👁️",
      label: t("eyeStrain"),
      headline: language === "kn" ? "ದೃಷ್ಟಿ ಮತ್ತು ನೇತ್ರ ತಪಾಸಣೆ 👨‍⚕️" : language === "hi" ? "दृष्टि एवं नेत्र विज्ञान 👨‍⚕️" : "Vision & ophthalmology 👨‍⚕️",
      advice: kiranDoc.about || "Dr. Kiran Rao specializes in eye strain, vision clarity, dry eye relief, and optical consultations.",
      doctorName: kiranDoc.name || "Dr. Kiran Rao",
      specialty: `${kiranDoc.specialty} (${kiranDoc.experience})`,
      fee: kiranDoc.fee || "₹550",
      actionLabel: `${t("book")} - ${kiranDoc.name}`,
      actionLink: "/appointment?doctor=dr-kiran",
      profileLink: "/doctor-profile/dr-kiran",
    },
  ];

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/doctors");
    }
  };

  return (
    <div className="app">
      {/* Top Welcome Announcement Banner */}
      {showTopBanner && (
        <div className="top-welcome-banner">
          <div className="top-banner-content">
            <span className="wave-emoji" style={{ fontSize: "16px" }}>👋</span>
            <span>{t("topBannerWelcome")}</span>
            <Link to="/doctors" className="top-banner-action">
              {t("exploreDoctors")}
            </Link>
          </div>
          <button
            type="button"
            className="top-banner-close"
            onClick={() => setShowTopBanner(false)}
            aria-label="Close welcome banner"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Dynamic Sticky Frosted Navigation Bar */}
      <Navbar />

      {/* =====================================================================
          LUXURY HEALTHCARE HERO SECTION
         ===================================================================== */}
      <section className="hero">
        <div className="hero-container">
          {/* Left Column: Headline & Interactive Booking Search */}
          <div className="hero-content">
            
            <div className="hero-badge-strip">
              <span className="hero-pill-badge">
                <span className="live-pulse-dot"></span>
                <span>
                  {language === "kn"
                    ? "6+ ಪರಿಣಿತ ವೈದ್ಯರು ಸಕ್ರಿಯ • 24/7 ತುರ್ತು ಆರೈಕೆ"
                    : language === "hi"
                    ? "6+ विशेषज्ञ डॉक्टर उपलब्ध • 24/7 आपातकालीन सेवा"
                    : "6+ Board-Certified Specialists Active • 24/7 Virtual OPD"}
                </span>
              </span>
              <span className="hero-security-pill">
                <ShieldCheck size={14} className="shield-icon" />
                <span>NABH & HIPAA Verified</span>
              </span>
            </div>

            <h1 className="hero-headline">
              {t("heroTitle1")} <br />
              <span className="headline-gradient">{t("heroTitle2")} {t("heroTitle3")}</span>
            </h1>

            <p className="hero-text">
              {t("heroSub")}
            </p>

            {/* Elevated Search Capsule */}
            <form onSubmit={handleHeroSearch} className="search-box">
              <div className="search-input-group">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                />
              </div>
              <button type="submit" className="search-cta-btn">
                <span>{t("searchBtn")}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Popular Filter Chips */}
            <div className="hero-quick-filters">
              <span className="quick-filter-label">
                {language === "kn" ? "ಜನಪ್ರಿಯ:" : language === "hi" ? "लोकप्रिय:" : "Popular:"}
              </span>
              <Link to="/doctors?specialty=Cardiology" className="quick-filter-tag">
                ❤️ {t("specialtyCardiology")}
              </Link>
              <Link to="/doctors?specialty=Dermatology" className="quick-filter-tag">
                🧴 {t("specialtyDermatology")}
              </Link>
              <Link to="/doctors?specialty=Pediatrics" className="quick-filter-tag">
                👶 {t("specialtyPediatrics")}
              </Link>
              <Link to="/doctors?specialty=Neurology" className="quick-filter-tag">
                🧠 {t("specialtyNeurology")}
              </Link>
            </div>

            {/* Trust Proof Points Row */}
            <div className="hero-proof-row">
              <div className="proof-item">
                <span className="proof-icon">⚡</span>
                <div>
                  <strong>&lt; 30s</strong>
                  <span>{t("instantBooking")}</span>
                </div>
              </div>
              <div className="proof-item">
                <span className="proof-icon">⭐</span>
                <div>
                  <strong>4.9 / 5</strong>
                  <span>{t("patientRating")}</span>
                </div>
              </div>
              <div className="proof-item">
                <span className="proof-icon">🛡️</span>
                <div>
                  <strong>100% Private</strong>
                  <span>{language === "kn" ? "ಸುರಕ್ಷಿತ ಸಮಾಲೋಚನೆ" : language === "hi" ? "सुरक्षित परामर्श" : "Encrypted Consultations"}</span>
                </div>
              </div>
            </div>

            {/* "How are you feeling today?" Interactive Quick Assessment */}
            <div className="emoji-health-check">
              <div className="emoji-check-header">
                <Stethoscope size={16} className="steth-icon" />
                <strong>{t("howAreYouFeeling")}</strong>
              </div>

              <div className="emoji-chips-row">
                {moodOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedMood(selectedMood?.id === opt.id ? null : opt)}
                    className={`emoji-chip ${selectedMood?.id === opt.id ? "active" : ""}`}
                  >
                    <span className="emoji-symbol">{opt.emoji}</span>
                    <span className="emoji-label">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Interactive Symptom Recommendation Dropdown Card */}
              {selectedMood && (
                <div className="emoji-advice-card">
                  <div className="advice-header">
                    <div className="advice-title-group">
                      <span className="advice-big-emoji">{selectedMood.emoji}</span>
                      <div>
                        <h4>{selectedMood.headline}</h4>
                        <p>{selectedMood.advice}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMood(null)}
                      className="advice-close-btn"
                      aria-label="Close recommendation"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {selectedMood.doctorName && (
                    <div className="advice-doctor-strip">
                      <div className="strip-info">
                        <span className="strip-badge">⭐ Recommended Doctor</span>
                        <strong>{selectedMood.doctorName}</strong>
                        <span className="strip-sub">{selectedMood.specialty} • Fee: {selectedMood.fee}</span>
                      </div>
                      <div className="strip-actions">
                        {selectedMood.profileLink && (
                          <Link to={selectedMood.profileLink} className="strip-btn-secondary">
                            View Profile
                          </Link>
                        )}
                        <Link to={selectedMood.actionLink} className="strip-btn-primary">
                          {selectedMood.actionLabel} ➔
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Modern Glassmorphic Clinical Showcase Hub */}
          <div className="hero-showcase">
            {/* Ambient Background Glow */}
            <div className="showcase-glow-circle"></div>

            {/* Main Featured Clinical Spotlight Card */}
            <div className="spotlight-card">
              <div className="spotlight-header">
                <div className="spotlight-tag">
                  <span className="live-dot-green"></span>
                  <span>{language === "kn" ? "ಆನ್‌ಲೈನ್ ವೈದ್ಯರು ಲಭ್ಯ" : language === "hi" ? "डॉक्टर ऑनलाइन उपलब्ध" : "Faculty On-Duty Today"}</span>
                </div>
                <span className="spotlight-fee-badge">₹500 / Visit</span>
              </div>

              <div className="spotlight-doctor-row">
                <div className="spotlight-avatar">
                  {poorviDoc.photo || "👩‍⚕️"}
                  <span className="avatar-online-indicator"></span>
                </div>
                <div className="spotlight-details">
                  <div className="spotlight-name-row">
                    <h3>{poorviDoc.name || "Poorvi"}</h3>
                    <span className="verified-check" title="Verified Specialist">✓</span>
                  </div>
                  <p className="spotlight-specialty">{poorviDoc.specialty || "Senior Dermatologist"}</p>
                  <p className="spotlight-exp">🏥 {poorviDoc.hospital ? poorviDoc.hospital.split(",")[0] : "MediBook Center"}</p>
                </div>
              </div>

              <div className="spotlight-metrics-row">
                <div className="spotlight-stat">
                  <strong>4.9 ⭐</strong>
                  <span>420+ Reviews</span>
                </div>
                <div className="spotlight-stat">
                  <strong>10+ Yrs</strong>
                  <span>Experience</span>
                </div>
                <div className="spotlight-stat">
                  <strong>Today</strong>
                  <span>Next: 10:30 AM</span>
                </div>
              </div>

              <div className="spotlight-actions">
                <Link to="/appointment?doctor=poorvi" className="spotlight-primary-cta">
                  <span>{t("bookAppointment")}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/doctor-profile/poorvi" className="spotlight-secondary-cta">
                  {t("viewProfile")}
                </Link>
              </div>
            </div>

            {/* Floating Satellite Badges */}
            <div className="satellite-pill pill-top-left">
              <div className="satellite-icon green">
                <CheckCircle size={15} />
              </div>
              <div className="satellite-text">
                <strong>Instant Token #04</strong>
                <span>Confirmed & Verified</span>
              </div>
            </div>

            <div className="satellite-pill pill-bottom-right">
              <div className="satellite-icon teal">
                <Video size={15} />
              </div>
              <div className="satellite-text">
                <strong>HD Telehealth</strong>
                <span>1-on-1 Video Active</span>
              </div>
            </div>

            <div className="satellite-pill pill-bottom-left">
              <div className="satellite-icon blue">
                <CreditCard size={15} />
              </div>
              <div className="satellite-text">
                <strong>Digital Health Pass</strong>
                <span>QR Access Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BENTO GRID: 4 CORE CLINICAL SERVICES
         ===================================================================== */}
      <section className="core-services-section">
        <div className="section-container">
          <div className="section-heading-clean">
            <span className="section-kicker">COMPREHENSIVE DIGITAL HEALTH</span>
            <h2>Everything You Need for Total Well-being</h2>
            <p>Designed for speed, clarity, and precision care across all medical specialties.</p>
          </div>

          <div className="bento-services-grid">
            {/* Bento Card 1: Specialists */}
            <Link to="/doctors" className="bento-card bento-card-highlight">
              <div className="bento-badge blue">6+ Board-Certified</div>
              <div className="bento-icon-wrapper blue">
                <Stethoscope size={28} />
              </div>
              <h3>{t("ourMedicalExperts")}</h3>
              <p>Consult with top specialists in Cardiology, Dermatology, Pediatrics, and Neurology.</p>
              <span className="bento-link">
                <span>{t("browseSpecialists")}</span>
                <ChevronRight size={16} />
              </span>
            </Link>

            {/* Bento Card 2: Digital Health Card */}
            <Link to="/health-card" className="bento-card">
              <div className="bento-badge emerald">New Feature</div>
              <div className="bento-icon-wrapper emerald">
                <CreditCard size={28} />
              </div>
              <h3>Digital Health Card</h3>
              <p>Carry your medical ID, blood group, allergies, and emergency contacts in one secure wallet pass.</p>
              <span className="bento-link">
                <span>View Health Card</span>
                <ChevronRight size={16} />
              </span>
            </Link>

            {/* Bento Card 3: Daily Vitals Tracker */}
            <Link to="/vitals" className="bento-card">
              <div className="bento-badge teal">Live Biomarkers</div>
              <div className="bento-icon-wrapper teal">
                <Activity size={28} />
              </div>
              <h3>Daily Vitals & Biomarkers</h3>
              <p>Log and visualize blood pressure, blood glucose, heart rate, and oxygen saturation over time.</p>
              <span className="bento-link">
                <span>Track Today's Vitals</span>
                <ChevronRight size={16} />
              </span>
            </Link>

            {/* Bento Card 4: Telehealth & Lab Tests */}
            <Link to="/lab-tests" className="bento-card">
              <div className="bento-badge amber">Fast Dispatch</div>
              <div className="bento-icon-wrapper amber">
                <Video size={28} />
              </div>
              <h3>Telehealth & Lab Diagnostic</h3>
              <p>Connect with doctors via HD virtual video call or order essential diagnostic laboratory tests.</p>
              <span className="bento-link">
                <span>Explore Diagnostics</span>
                <ChevronRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          MEDICAL SPECIALIZATIONS SECTION
         ===================================================================== */}
      <section id="specializations" className="specializations">
        <div className="section-container">
          <div className="section-heading-clean">
            <span className="section-kicker">{t("explore")}</span>
            <h2>{t("medicalSpecializations")}</h2>
            <p>Access qualified specialists across primary and advanced medical departments.</p>
          </div>

          <div className="specialty-grid">
            <Link to="/doctors?specialty=Cardiology" className="specialty-card">
              <div className="specialty-icon-bubble cardiology">❤️</div>
              <h3>{t("specialtyCardiology")}</h3>
              <p>{t("specDescCardiology")}</p>
              <span className="specialty-link-pill">
                {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "परामर्श ➔" : "Consult ➔"}
              </span>
            </Link>

            <Link to="/doctors?specialty=Dermatology" className="specialty-card">
              <div className="specialty-icon-bubble dermatology">🧴</div>
              <h3>{t("specialtyDermatology")}</h3>
              <p>{t("specDescDermatology")}</p>
              <span className="specialty-link-pill">
                {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "परामर्श ➔" : "Consult ➔"}
              </span>
            </Link>

            <Link to="/doctors?specialty=Pediatrics" className="specialty-card">
              <div className="specialty-icon-bubble pediatrics">👶</div>
              <h3>{t("specialtyPediatrics")}</h3>
              <p>{t("specDescPediatrics")}</p>
              <span className="specialty-link-pill">
                {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "ಪರಾಮರ್ಶ ➔" : "Consult ➔"}
              </span>
            </Link>

            <Link to="/doctors?specialty=Dentistry" className="specialty-card">
              <div className="specialty-icon-bubble dentistry">🦷</div>
              <h3>{t("specialtyDentistry")}</h3>
              <p>{t("specDescDentistry")}</p>
              <span className="specialty-link-pill">
                {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "ಪರಾಮರ್ಶ ➔" : "Consult ➔"}
              </span>
            </Link>

            <Link to="/doctors?specialty=Neurology" className="specialty-card">
              <div className="specialty-icon-bubble neurology">🧠</div>
              <h3>{t("specialtyNeurology")}</h3>
              <p>{t("specDescNeurology")}</p>
              <span className="specialty-link-pill">
                {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "ಪರಾಮರ್ಶ ➔" : "Consult ➔"}
              </span>
            </Link>

            <Link to="/doctors?specialty=Ophthalmology" className="specialty-card">
              <div className="specialty-icon-bubble ophthalmology">👁️</div>
              <h3>{t("specialtyOphthalmology")}</h3>
              <p>{t("specDescOphthalmology")}</p>
              <span className="specialty-link-pill">
                {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "ಪರಾಮರ್ಶ ➔" : "Consult ➔"}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FEATURED DOCTORS SHOWCASE
         ===================================================================== */}
      <section className="doctors">
        <div className="section-container">
          <div className="section-heading-clean">
            <span className="section-kicker">{t("ourExperts")}</span>
            <h2>{t("featuredDoctors")}</h2>
            <p>Certified clinical experts available for physical and video consultations.</p>
          </div>

          <div className="doctor-grid">
            {featuredDoctors.map((doc) => (
              <div className="doctor-card" key={doc.id}>
                <div className="doctor-card-top-tag">
                  <span className="doc-verified-badge">
                    ✓ {language === "kn" ? "ಪರಿಶೀಲಿಸಲಾಗಿದೆ" : language === "hi" ? "सत्यापित" : "Verified Specialist"}
                  </span>
                  <span className="doc-fee-tag">{doc.fee}</span>
                </div>
                <div className="doctor-photo-wrapper">
                  <div className="doctor-photo">{doc.photo}</div>
                  <span className="doctor-active-dot" title="Available for consult"></span>
                </div>
                <h3>{doc.name}</h3>
                <p className="doctor-card-spec">{doc.specialty}</p>
                <p className="doctor-card-hosp">🏥 {doc.hospital ? doc.hospital.split("Care")[0].trim() : "MediBook Center"}</p>
                
                <div className="doctor-card-meta-row">
                  <span className="rating-chip">⭐ {doc.rating}</span>
                  <span className="exp-chip">{doc.experience}</span>
                </div>

                <div className="doctor-next-slot">
                  <span>🟢 {language === "kn" ? "ಮುಂದಿನ ಸ್ಲಾಟ್: ಇಂದು ಲಭ್ಯವಿದೆ" : language === "hi" ? "अगला स्लॉट: आज उपलब्ध" : "Next Available: Today"}</span>
                </div>

                <div className="doctor-card-actions">
                  <Link to={`/doctor-profile/${doc.id}`} className="view-btn">
                    {t("viewProfile")}
                  </Link>
                  <Link to={`/appointment?doctor=${doc.id}`} className="book-btn">
                    {t("bookAppointment")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Doctor Floating Assistant */}
      <SymptomChecker />

      {/* =====================================================================
          EXECUTIVE FOOTER
         ===================================================================== */}
      <footer id="contact" className="modern-footer">
        <div className="footer-container">
          <div className="footer-col-brand">
            <div className="footer-brand-logo">
              <span style={{ fontSize: "24px" }}>🩺</span>
              <h2>MediBook</h2>
            </div>
            <p className="footer-desc">
              Next-generation clinical appointment scheduling, digital patient health passes, and biomarker tracking.
            </p>
            <div className="footer-badges">
              <span className="footer-pill">NABH Certified</span>
              <span className="footer-pill">HIPAA Compliant</span>
            </div>
          </div>

          <div className="footer-col-links">
            <h4>{language === "kn" ? "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು" : language === "hi" ? "त्वरित लिंक" : "Quick Links"}</h4>
            <ul>
              <li><Link to="/">{t("home")}</Link></li>
              <li><Link to="/doctors">{t("doctors")}</Link></li>
              <li><Link to="/my-appointments">{t("myAppointments")}</Link></li>
              <li><Link to="/health-card">Digital Health Card</Link></li>
              <li><Link to="/vitals">Daily Vitals Tracker</Link></li>
              <li><Link to="/lab-tests">{t("labTests")}</Link></li>
            </ul>
          </div>

          <div className="footer-col-contact">
            <h4>{t("contact")} & Support</h4>
            <p><strong>Emergency:</strong> 108 / 112</p>
            <p><strong>Clinical Desk:</strong> +91 98765 43210</p>
            <p><strong>Email:</strong> support@medibook.health</p>
            <p><strong>Hours:</strong> Mon – Sat: 8:00 AM – 9:00 PM</p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} MediBook Healthcare Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            
            {/* Doctor Profile */}
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/doctor-profile/:id" element={<DoctorProfile />} />

            {/* Appointment Booking */}
            <Route path="/appointment" element={<Appointment />} />
            
            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* My Appointments & Health Hub */}
            <Route path="/my-appointments" element={<MyAppointments />} />
            
            {/* Direct Diagnostic Lab Tests Route */}
            <Route
              path="/lab-tests"
              element={
                <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
                  <Navbar />
                  <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px 80px" }}>
                    <LabReports />
                  </div>
                </div>
              }
            />

            {/* Digital Health Card Route */}
            <Route
              path="/health-card"
              element={
                <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
                  <Navbar />
                  <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px 80px" }}>
                    <HealthCard />
                  </div>
                </div>
              }
            />

            {/* Daily Vitals & Biomarker Tracker */}
            <Route
              path="/vitals"
              element={
                <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
                  <Navbar />
                  <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px 80px" }}>
                    <VitalsTracker />
                  </div>
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
