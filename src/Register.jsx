import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, ArrowRight, HeartPulse, CheckCircle } from "lucide-react";
import "./login.css"; // Reuse the polished auth styles

function Register() {
  const navigate = useNavigate();
  const { register, isConfigured } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validations
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full legal name.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify and re-enter.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("You must accept MediBook's Terms of Service and HIPAA Privacy Notice.");
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      if (res.provider === "supabase" && !res.session) {
        setSuccessMsg(
          "Registration successful! Please check your email inbox to verify your account before logging in."
        );
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } else {
        setSuccessMsg("Patient account created successfully! Redirecting...");
        setTimeout(() => {
          navigate("/doctors");
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <HeartPulse className="logo-icon" size={28} />
            <span>MediBook</span>
          </Link>
          <h1>Create Patient Account</h1>
          <p>Join MediBook for easy online doctor appointment bookings</p>
        </div>

        {/* Configuration Notice if Supabase not configured */}
        {!isConfigured && (
          <div className="auth-alert info">
            <strong>Configuration Notice:</strong> Live Supabase credentials are not set in <code>.env</code>. Newly registered accounts are stored securely in local browser storage so you can log in immediately.
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="auth-alert error" role="alert">
            {errorMsg}
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="auth-alert success" role="alert">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          
          <div className="form-group">
            <label htmlFor="fullName">Full Legal Name</label>
            <div className="input-wrapper">
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>
          </div>

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
            <label htmlFor="password">Create Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <label className="checkbox-label" style={{ marginTop: "4px" }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <span>
              I accept the MediBook <strong>Terms of Service</strong> and <strong>HIPAA Privacy Notice</strong>.
            </span>
          </label>

          <button type="submit" className="submit-btn" disabled={loading}>
            <span>{loading ? "Creating Account..." : "Register as Patient"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Sign in here</Link>
          <br />
          <Link to="/" className="back-home">
            &larr; Back to MediBook Home
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;
