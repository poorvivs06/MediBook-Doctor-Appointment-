import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { LogOut, Globe } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isConfigured } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <span style={{ fontSize: "22px", marginRight: "4px" }}>🩺</span>
          <span>MediBook</span>
        </Link>

        <div className="backend-indicator" title={
          isConfigured
            ? "Supabase cloud database is connected and active"
            : "Running in local storage fallback mode. Add your Supabase keys in .env to enable cloud features."
        }>
          <span className={`status-dot ${isConfigured ? "connected" : "local"}`}></span>
          <span className="status-label">
            {isConfigured ? "Supabase Live" : "Local Mode"}
          </span>
        </div>
      </div>

      <div className="nav-links">
        <Link to="/">{t("home")}</Link>
        <Link to="/doctors">{t("doctors")}</Link>
        <Link to="/my-appointments">{t("myAppointments")}</Link>
        <Link to="/lab-tests" className="lab-tests-nav-link">
          <span className="lab-badge-pulse"></span>
          🧪 {t("labTests")}
        </Link>
        <a href="/#specializations">{t("specialties")}</a>
        <a href="/#contact">{t("contact")}</a>
      </div>

      <div className="nav-buttons">
        {/* Multi-Language Selector */}
        <div className="lang-picker-wrapper" title="Change Language">
          <Globe size={15} className="lang-icon" />
          <select
            className="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select Language"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        {user ? (
          <div className="user-profile-menu">
            <Link to="/my-appointments" className="user-badge" title="View my bookings">
              <div className="avatar-circle">
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
              <span className="user-name">
                👋 {t("hi")}, {user.fullName ? user.fullName.split(" ")[0] : user.email.split("@")[0]}!
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="logout-button"
              title="Sign out of MediBook"
            >
              <LogOut size={16} />
              <span>{t("logout")}</span>
            </button>
          </div>
        ) : (
          <div className="guest-buttons">
            <Link to="/login" className="login-btn">
              {t("login")}
            </Link>
            <Link to="/register" className="register-btn">
              {t("register")}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
