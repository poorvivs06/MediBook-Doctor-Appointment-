import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import {
  LogOut,
  Globe,
  FlaskConical,
  Activity,
  Pill,
  CreditCard,
  CalendarCheck,
  Stethoscope,
  Home,
  Menu,
  X,
} from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isConfigured } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon-badge">🩺</span>
          <span>MediBook</span>
        </Link>

        <div
          className="backend-indicator"
          title={
            isConfigured
              ? "Supabase cloud database is connected and active"
              : "Running in local storage fallback mode. Add your Supabase keys in .env to enable cloud features."
          }
        >
          <span className={`status-dot ${isConfigured ? "connected" : "local"}`}></span>
          <span className="status-label">
            {isConfigured ? "Supabase Live" : "Local Mode"}
          </span>
        </div>
      </div>

      {/* Desktop Navigation Links — Every portal section is separate & directly accessible */}
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-item-link ${isActive ? "active" : ""}`}>
          <Home size={14} />
          <span>{t("home")}</span>
        </NavLink>

        <NavLink to="/doctors" className={({ isActive }) => `nav-item-link ${isActive ? "active" : ""}`}>
          <Stethoscope size={14} />
          <span>{t("doctors")}</span>
        </NavLink>

        <NavLink to="/my-appointments" className={({ isActive }) => `nav-item-link ${isActive ? "active" : ""}`}>
          <CalendarCheck size={14} />
          <span>{t("myAppointments")}</span>
        </NavLink>

        <NavLink to="/lab-tests" className={({ isActive }) => `nav-item-link pill-labs ${isActive ? "active" : ""}`}>
          <span className="lab-badge-pulse"></span>
          <FlaskConical size={14} />
          <span>{t("labTests")}</span>
        </NavLink>

        <NavLink to="/vitals" className={({ isActive }) => `nav-item-link pill-vitals ${isActive ? "active" : ""}`}>
          <Activity size={14} />
          <span>{t("vitalsNav")}</span>
        </NavLink>

        <NavLink to="/medicines" className={({ isActive }) => `nav-item-link pill-meds ${isActive ? "active" : ""}`}>
          <Pill size={14} />
          <span>{t("medicinesNav")}</span>
        </NavLink>

        <NavLink to="/health-card" className={({ isActive }) => `nav-item-link pill-card ${isActive ? "active" : ""}`}>
          <CreditCard size={14} />
          <span>{t("healthCardNav")}</span>
        </NavLink>
      </div>

      <div className="nav-buttons">
        {/* Multi-Language Selector */}
        <div className="lang-picker-wrapper" title="Change Language">
          <Globe size={14} className="lang-icon" />
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
                {t("hi")}, {user.fullName ? user.fullName.split(" ")[0] : user.email.split("@")[0]}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="logout-button"
              title="Sign out of MediBook"
            >
              <LogOut size={15} />
              <span className="logout-label">{t("logout")}</span>
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

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <NavLink to="/" end onClick={closeMenu} className="mobile-nav-item">
            <Home size={16} /> <span>{t("home")}</span>
          </NavLink>
          <NavLink to="/doctors" onClick={closeMenu} className="mobile-nav-item">
            <Stethoscope size={16} /> <span>{t("doctors")}</span>
          </NavLink>
          <NavLink to="/my-appointments" onClick={closeMenu} className="mobile-nav-item">
            <CalendarCheck size={16} /> <span>{t("myAppointments")}</span>
          </NavLink>
          <NavLink to="/lab-tests" onClick={closeMenu} className="mobile-nav-item">
            <FlaskConical size={16} /> <span>{t("labTests")}</span>
          </NavLink>
          <NavLink to="/vitals" onClick={closeMenu} className="mobile-nav-item">
            <Activity size={16} /> <span>{t("vitalsNav")}</span>
          </NavLink>
          <NavLink to="/medicines" onClick={closeMenu} className="mobile-nav-item">
            <Pill size={16} /> <span>{t("medicinesNav")}</span>
          </NavLink>
          <NavLink to="/health-card" onClick={closeMenu} className="mobile-nav-item">
            <CreditCard size={16} /> <span>{t("healthCardNav")}</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
}
