import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, ArrowRight, HeartPulse, KeyRound, CheckCircle2, X, User } from "lucide-react";
import "./login.css";
import "./MedicalSlip.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [resetError, setResetError] = useState("");
  const [localAccounts, setLocalAccounts] = useState([]);

  // Load existing registered accounts from localStorage
  const loadExistingAccounts = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("medibook_local_users") || "[]");
      setLocalAccounts(stored);
      return stored;
    } catch {
      setLocalAccounts([]);
      return [];
    }
  };

  useEffect(() => {
    loadExistingAccounts();
    // If navigated with ?reset=true or from /forgot-password
    if (location.search.includes("reset=true") || location.pathname === "/forgot-password") {
      setShowForgotModal(true);
    }
  }, [location]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      setSuccessMsg(`Welcome back, ${res.user?.fullName || res.user?.email || "Patient"}!`);
      setTimeout(() => {
        navigate("/doctors");
      }, 800);
    } catch (err) {
      if (!isConfigured && err.message?.includes("No account found")) {
        setErrorMsg(
          "Account not found. Click 'Forgot password?' to reset or register your account."
        );
      } else {
        setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("demo@medibook.com");
    setPassword("password123");
    setErrorMsg("");
  }

  function openResetModal() {
    loadExistingAccounts();
    // Default to the email currently typed into the login input, or blank
    setResetEmail(email.trim());
    setResetError("");
    setResetMsg("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowForgotModal(true);
  }

  function handleResetPassword(e) {
    e.preventDefault();
    setResetMsg("");
    setResetError("");

    const cleanEmail = resetEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setResetError("Please enter your registered email address.");
      return;
    }

    if (newPassword.length < 6) {
      setResetError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError("Passwords do not match. Please re-type your new password.");
      return;
    }

    try {
      const currentList = JSON.parse(localStorage.getItem("medibook_local_users") || "[]");
      const idx = currentList.findIndex((u) => u.email.toLowerCase() === cleanEmail);

      let accountName = cleanEmail.split("@")[0];

      if (idx !== -1) {
        // Update password for the existing same account
        currentList[idx].password = newPassword.trim();
        accountName = currentList[idx].fullName || currentList[idx].email;
        localStorage.setItem("medibook_local_users", JSON.stringify(currentList));
      } else {
        // Register / record user with new password
        currentList.push({
          id: `local-usr-${Date.now()}`,
          email: cleanEmail,
          fullName: accountName,
          password: newPassword.trim(),
          role: "patient",
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("medibook_local_users", JSON.stringify(currentList));
      }

      // Refresh accounts list
      loadExistingAccounts();

      setResetMsg(`Password reset successfully for ${accountName} (${cleanEmail})! Updating your login...`);
      setEmail(cleanEmail);
      setPassword(newPassword.trim());

      setTimeout(() => {
        setShowForgotModal(false);
        setResetMsg("");
        setResetEmail("");
        setNewPassword("");
        setConfirmNewPassword("");
      }, 1500);
    } catch {
      setResetError("Failed to reset password. Please check browser storage permissions.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        {/* Brand Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <HeartPulse className="logo-icon" size={28} />
            <span>MediBook</span>
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your MediBook healthcare portal</p>
        </div>

        {/* Informational Status banner if Supabase not configured */}
        {!isConfigured && (
          <div className="auth-alert info">
            <strong>Portal Active:</strong> Sign in with your registered account, or click <strong>Forgot password?</strong> to reset your password.
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-alert error" role="alert">
            {errorMsg}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="auth-alert success" role="alert">
            {successMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-row-between">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={openResetModal}
              className="forgot-link"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Helper for immediate testing */}
        <div className="demo-helper">
          <div className="demo-helper-title">
            <span>Instant Test Account</span>
          </div>
          <p>Click below to fill test account:</p>
          <div className="demo-btn-row">
            <button type="button" onClick={fillDemo} className="demo-chip">
              demo@medibook.com (password123)
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="auth-footer">
          <span>New patient on MediBook?</span>
          <Link to="/register">Create an account</Link>
          <br />
          <Link to="/" className="back-home">
            &larr; Back to MediBook Home
          </Link>
        </div>

      </div>

      {/* Forgot Password Reset Modal */}
      {showForgotModal && (
        <div className="medical-slip-overlay" onClick={() => setShowForgotModal(false)}>
          <div
            className="medical-slip-modal"
            style={{ maxWidth: "460px", padding: "30px 24px", background: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#087f8c" }}>
                <KeyRound size={22} />
                <h3 style={{ margin: 0, fontSize: "18px", color: "#172b4d" }}>Reset Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="close-btn"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
              Select or enter your registered account email, and choose a new password.
            </p>

            {/* List existing registered accounts on this browser if any */}
            {localAccounts.length > 0 && (
              <div style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#f0fdfa",
                borderRadius: "10px",
                border: "1px solid #ccfbf1"
              }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#0f766e", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <User size={14} />
                  <span>Your Registered Accounts on this Device:</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {localAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setResetEmail(acc.email);
                        setResetError("");
                      }}
                      style={{
                        background: resetEmail.toLowerCase() === acc.email.toLowerCase() ? "#087f8c" : "#ffffff",
                        color: resetEmail.toLowerCase() === acc.email.toLowerCase() ? "#ffffff" : "#1e293b",
                        border: "1.5px solid " + (resetEmail.toLowerCase() === acc.email.toLowerCase() ? "#087f8c" : "#cbd5e1"),
                        borderRadius: "6px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: resetEmail.toLowerCase() === acc.email.toLowerCase() ? "bold" : "500",
                        transition: "all 0.15s"
                      }}
                    >
                      {acc.fullName ? `${acc.fullName} (${acc.email})` : acc.email}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {resetError && (
              <div className="auth-alert error" style={{ marginBottom: "14px" }}>
                {resetError}
              </div>
            )}

            {resetMsg && (
              <div className="auth-alert success" style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} />
                <span>{resetMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label>Your Account Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                style={{ marginTop: "10px" }}
              >
                Reset & Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
