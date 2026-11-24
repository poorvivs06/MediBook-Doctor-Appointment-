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
import DoctorDoll from "./DoctorDoll";
import LabReports from "./LabReports";
import HealthCard from "./HealthCard";
import VitalsTracker from "./VitalsTracker";
import { doctors as defaultDoctors, getDoctorById, getLocalizedDoctor } from "./doctorsData";
import { AuthProvider, useAuth } from "./AuthContext";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { ArrowRight, Sparkles, X, CheckCircle, HeartPulse, UserCheck, ShieldCheck, Clock, Calendar } from "lucide-react";
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

  const featuredDoctors = defaultDoctors.slice(0, 3).map((d) => getLocalizedDoctor(d, language));

  const moodOptions = [
    {
      id: "great",
      emoji: "😊",
      label: t("feelingGreat"),
      headline: language === "kn" ? "ನೀವು ಉತ್ತಮ ಆರೋಗ್ಯದಲ್ಲಿದ್ದೀರಿ! 🌟" : language === "hi" ? "आप बिल्कुल स्वस्थ हैं! 🌟" : "You're in great shape! 🌟",
      advice: language === "kn" ? "ಸಂತೋಷದ ಸುದ್ದಿ! ನಿಯಮಿತ ತಪಾಸಣೆಗಳು ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡುತ್ತವೆ." : language === "hi" ? "यह जानकर बहुत खुशी हुई! नियमित स्वास्थ्य जांच आपको ऊर्जावान बनाए रखती है।" : "Wonderful to hear! Regular wellness checkups keep you healthy, energized, and proactive.",
      doctorName: null,
      actionLabel: t("browseSpecialists"),
      actionLink: "/doctors",
    },
    {
      id: "skin",
      emoji: "🧴",
      label: t("skinAllergy"),
      headline: language === "kn" ? "ಚರ್ಮದ ಸಮಸ್ಯೆ ಅಥವಾ ಅಲರ್ಜಿಯೇ? 👩‍⚕️" : language === "hi" ? "त्वचा में जलन या एलर्जी? 👩‍⚕️" : "Skin irritation or allergies? 👩‍⚕️",
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
            <span className="wave-emoji" style={{ fontSize: "17px" }}>👋</span>
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

      {/* Dynamic Navigation Bar with Supabase Auth & Status */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          
          {/* Animated Greeting Badge */}
          <div className="hero-greeting-badge">
            <span className="wave-emoji">👋</span>
            <span className="greeting-text">
              {displayName ? (
                <>
                  <strong>{timeText}, {displayName}!</strong> {timeEmoji}
                </>
              ) : (
                <>
                  <strong>{timeText}! MediBook</strong> {timeEmoji}
                </>
              )}
            </span>
          </div>

          <div className="hero-trust-pill">
            <span className="live-pulse-dot"></span>
            <span>
              {language === "kn"
                ? "● 6+ ಪರಿಣಿತ ವೈದ್ಯರು ಲಭ್ಯ • 24/7 ತುರ್ತು ಆರೈಕೆ"
                : language === "hi"
                ? "● 6+ प्रमाणित डॉक्टर ऑनलाइन • 24/7 आपातकालीन सेवा"
                : "● 6+ Board-Certified Doctors Active • 24/7 Virtual OPD"}
            </span>
          </div>

          <p className="small-title">{t("healthPriority")}</p>

          <h1>
            {t("heroTitle1")}
            <br />
            {t("heroTitle2")}{" "}
            <span className="hero-highlight-word">
              {t("heroTitle3")}
              <svg className="brush-underline-svg" viewBox="0 0 170 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10C45 3.5 125 3.5 167 10" stroke="#087f8c" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>{" "}
            🩺
          </h1>

          <p className="hero-text">{t("heroSub")}</p>

          {/* Working Search Bar with Quick Tags */}
          <form onSubmit={handleHeroSearch} className="search-box">
            <span className="search-input-icon">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
            />
            <button type="submit">{t("searchBtn")}</button>
          </form>

          {/* Quick Specialty Filter Chips */}
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
                <strong>NABH & HIPAA</strong>
                <span>{language === "kn" ? "ಪ್ರಮಾಣೀಕೃತ" : language === "hi" ? "प्रमाणित" : "Accredited"}</span>
              </div>
            </div>
          </div>

          {/* "How are you feeling today?" Interactive Emoji Mood & Health Check-in */}
          <div className="emoji-health-check">
            <div className="emoji-check-header">
              <span style={{ fontSize: "16px" }}>🩺</span>
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

            {/* Interactive Emoji Recommendation Card */}
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

                {!selectedMood.doctorName && (
                  <div className="advice-doctor-strip">
                    <span className="strip-sub">Schedule your routine health review:</span>
                    <Link to={selectedMood.actionLink} className="strip-btn-primary">
                      {selectedMood.actionLabel} ➔
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Helper Callout */}
          <div className="hero-ai-callout">
            <span style={{ fontSize: "18px" }}>🤖</span>
            <span>
              Need a symptom analysis? Click our floating <strong>AI Doctor Finder</strong> in the bottom right anytime!
            </span>
          </div>
        </div>

        {/* Upgraded Engaging Hero Right Card with Doctor Doll Mascot */}
        <div className="hero-card" style={{ width: "300px" }}>
          <div className="doctor-icon-animated">
            <DoctorDoll
              size={135}
              speechText="Hi! I'm Dr. Medi 👋 How can I help you feel better today?"
              showBadge={true}
            />
            <span className="floating-badge badge-top-left" title="Cardiology">❤️</span>
            <span className="floating-badge badge-top-right" title="Dermatology">🧴</span>
            <span className="floating-badge badge-bottom-left" title="Pediatrics">👶</span>
            <span className="floating-badge badge-bottom-right" title="Dentistry">🦷</span>
          </div>

          <h3>{t("certifiedExperts")}</h3>
          <p>{t("certifiedSub")}</p>

          <div className="hero-card-badges">
            <span className="mini-badge">{t("instantBooking")}</span>
            <span className="mini-badge">{t("printableSlip")}</span>
            <span className="mini-badge">{t("patientRating")}</span>
          </div>

          <Link to="/doctors" className="hero-card-cta">
            <span>{t("browseSpecialists")}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Floating 4-Pillar Trust Capsule Bar bridging Hero & Specializations */}
      <div className="hero-trust-capsule-bar">
        <div className="trust-capsule-item">
          <div className="capsule-icon-box">
            <Calendar size={22} color="#087f8c" />
          </div>
          <div className="capsule-text">
            <strong>Easy Booking</strong>
            <span>in Few Clicks</span>
          </div>
        </div>

        <div className="trust-capsule-item">
          <div className="capsule-icon-box">
            <UserCheck size={22} color="#087f8c" />
          </div>
          <div className="capsule-text">
            <strong>Top Rated</strong>
            <span>Verified Doctors</span>
          </div>
        </div>

        <div className="trust-capsule-item">
          <div className="capsule-icon-box">
            <ShieldCheck size={22} color="#087f8c" />
          </div>
          <div className="capsule-text">
            <strong>Secure & Private</strong>
            <span>NABH & HIPAA Compliant</span>
          </div>
        </div>

        <div className="trust-capsule-item">
          <div className="capsule-icon-box">
            <Clock size={22} color="#087f8c" />
          </div>
          <div className="capsule-text">
            <strong>Instant Token & QR</strong>
            <span>Live Queue Pass</span>
          </div>
        </div>
      </div>

      {/* Medical Specializations (Clickable Specialty Cards) */}
      <section id="specializations" className="specializations">
        <div className="section-heading">
          <p>{t("explore")}</p>
          <h2>{t("medicalSpecializations")}</h2>
        </div>

        <div className="specialty-grid">
          <Link
            to="/doctors?specialty=Cardiology"
            className="specialty-card"
          >
            <div className="specialty-icon-bubble cardiology">❤️</div>
            <h3>{t("specialtyCardiology")}</h3>
            <p>{t("specDescCardiology")}</p>
            <span className="specialty-link-pill">
              {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "परामर्श ➔" : "Consult ➔"}
            </span>
          </Link>

          <Link
            to="/doctors?specialty=Dermatology"
            className="specialty-card"
          >
            <div className="specialty-icon-bubble dermatology">🧴</div>
            <h3>{t("specialtyDermatology")}</h3>
            <p>{t("specDescDermatology")}</p>
            <span className="specialty-link-pill">
              {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "परामर्श ➔" : "Consult ➔"}
            </span>
          </Link>

          <Link
            to="/doctors?specialty=Pediatrics"
            className="specialty-card"
          >
            <div className="specialty-icon-bubble pediatrics">👶</div>
            <h3>{t("specialtyPediatrics")}</h3>
            <p>{t("specDescPediatrics")}</p>
            <span className="specialty-link-pill">
              {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "परामर्श ➔" : "Consult ➔"}
            </span>
          </Link>

          <Link
            to="/doctors?specialty=Dentistry"
            className="specialty-card"
          >
            <div className="specialty-icon-bubble dentistry">🦷</div>
            <h3>{t("specialtyDentistry")}</h3>
            <p>{t("specDescDentistry")}</p>
            <span className="specialty-link-pill">
              {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "परामर्श ➔" : "Consult ➔"}
            </span>
          </Link>

          <Link
            to="/doctors?specialty=Neurology"
            className="specialty-card"
          >
            <div className="specialty-icon-bubble neurology">🧠</div>
            <h3>{t("specialtyNeurology")}</h3>
            <p>{t("specDescNeurology")}</p>
            <span className="specialty-link-pill">
              {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "परामर्श ➔" : "Consult ➔"}
            </span>
          </Link>

          <Link
            to="/doctors?specialty=Ophthalmology"
            className="specialty-card"
          >
            <div className="specialty-icon-bubble ophthalmology">👁️</div>
            <h3>{t("specialtyOphthalmology")}</h3>
            <p>{t("specDescOphthalmology")}</p>
            <span className="specialty-link-pill">
              {language === "kn" ? "ಸಮಾಲೋಚಿಸಿ ➔" : language === "hi" ? "परामर्श ➔" : "Consult ➔"}
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Doctors (Dynamic & Localized in English, Kannada, and Hindi) */}
      <section className="doctors">
        <div className="section-heading">
          <p>{t("ourExperts")}</p>
          <h2>{t("featuredDoctors")}</h2>
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
      </section>

      {/* Footer */}
      <footer id="contact">
        <div>
          <h2>MediBook</h2>
          <p id="about">
            Making healthcare appointments simple and accessible.
          </p>
        </div>

        <div>
          <h3>{language === "kn" ? "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು" : language === "hi" ? "त्वरित लिंक" : "Quick Links"}</h3>
          <p><Link to="/" style={{ color: "inherit", textDecoration: "none" }}>{t("home")}</Link></p>
          <p><Link to="/doctors" style={{ color: "inherit", textDecoration: "none" }}>{t("doctors")}</Link></p>
          <p><Link to="/my-appointments" style={{ color: "inherit", textDecoration: "none" }}>{t("myAppointments")}</Link></p>
          <p><Link to="/login" style={{ color: "inherit", textDecoration: "none" }}>{t("login")}</Link></p>
          <p><Link to="/register" style={{ color: "inherit", textDecoration: "none" }}>{t("register")}</Link></p>
        </div>

        <div>
          <h3>{t("contact")}</h3>
          <p>support@medibook.com</p>
          <p>+91 98765 43210</p>
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
            <Route path="/appointment/:id" element={<Appointment />} />

            {/* Patient Bookings Portal */}
            <Route path="/my-appointments" element={<MyAppointments />} />

            {/* Diagnostic Lab Tests & Pathology Portal */}
            <Route
              path="/lab-tests"
              element={
                <div className="app">
                  <Navbar />
                  <main style={{ padding: "30px 7% 70px" }}>
                    <LabReports />
                  </main>
                </div>
              }
            />

            {/* Digital Patient Health Card & Emergency Pass */}
            <Route
              path="/health-card"
              element={
                <div className="app">
                  <Navbar />
                  <main style={{ padding: "30px 7% 70px" }}>
                    <HealthCard />
                  </main>
                </div>
              }
            />

            {/* Daily Vitals & Biomarker Tracker */}
            <Route
              path="/vitals"
              element={
                <div className="app">
                  <Navbar />
                  <main style={{ padding: "30px 7% 70px" }}>
                    <VitalsTracker />
                  </main>
                </div>
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<Login />} />
            <Route path="/reset-password" element={<Login />} />

            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>

          {/* Global AI Health Symptom Checker & Doctor Matcher */}
          <SymptomChecker />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
