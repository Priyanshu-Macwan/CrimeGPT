import { useState } from 'react';
import './LoginPage.css';

/**
 * LoginPage Component
 * 
 * Split-panel layout:
 *   Left  – Branding panel (dark navy) with logo, headline, features, footer
 *   Right – Login form with validation, password toggle, and disclaimer
 * 
 * Responsive: Left panel hidden below 1024px; mobile logo shown instead.
 */

/* ── Static Data ── */

const FEATURES = [
  {
    icon: 'description',
    title: 'FIR Generation',
    description: 'Automate First Information Reports with intelligent data extraction.',
  },
  {
    icon: 'gavel',
    title: 'Legal Sections',
    description: 'Instant mapping of case details to relevant penal codes and statutes.',
  },
  {
    icon: 'track_changes',
    title: 'Case Tracking',
    description: 'Comprehensive lifecycle management from incident to prosecution.',
  },
];

/* ── External image URLs (from the original HTML) ── */
const LOGO_URL = '/logo.png';

const WATERMARK_URL =
  'https://lh3.googleusercontent.com/aida/AP1WRLtvs9CtcLKMW92wt9j9omfLiNAFyaSdN7dBqPckWMN_B6kWTgbC8PV6jow7P3BWTjJv7P2iHxrwHZXqdaVUQWl6Udu6tNvMOOoKHQLg9OGCJdkKWP2eBxhKIDE8EuK6sOQt5VWRtljxAjn4N1z7H3JZ0ZnkgQadrgJvvYYlCaBELNatsk4EWvqBxrXtfq7xduukveKCdzyUkockUN-CIQWkg9DK43wv0iSJSokYVRDGxNjHS4bqdQUnAdtV';


export default function LoginPage() {
  /* ── Form State ── */
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ── Validation State ── */
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /**
   * Validate form fields.
   * Returns an object of field → error message (empty if valid).
   */
  const validate = () => {
    const errs = {};

    if (!officerId.trim()) {
      errs.officerId = 'Officer ID or email is required.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    return errs;
  };

  /** Handle form submission */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      // No backend — log the attempt
      console.log('Login submitted:', { officerId, rememberMe });
    }
  };

  /** Toggle password visibility */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-page">
      {/* =========================================
          LEFT PANEL — Branding (desktop only)
          ========================================= */}
      <aside className="login-branding" aria-hidden="true">
        {/* Watermark Badge */}
        <div className="branding-watermark">
          <img src={WATERMARK_URL} alt="" />
        </div>

        <div className="branding-content">
          {/* Logo + Headline */}
          <div>
            <img
              src={LOGO_URL}
              alt="CrimeGPT Logo"
              className="branding-logo"
            />
            <h1 className="branding-title">AI-Powered Crime Documentation</h1>
            <p className="branding-tagline">
              Streamlining law enforcement reporting with precision, speed, and
              uncompromising security.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="feature-list">
            {FEATURES.map((feature) => (
              <div className="feature-item" key={feature.icon}>
                <div className="feature-icon-box">
                  <span className="material-symbols-outlined">
                    {feature.icon}
                  </span>
                </div>
                <div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="branding-footer">
            <p className="branding-footer-text">
              Nexus AI Systems • Law Enforcement Edition
            </p>
          </div>
        </div>
      </aside>

      {/* =========================================
          RIGHT PANEL — Login Form
          ========================================= */}
      <main className="login-form-panel">
        <div className="login-form-container">
          {/* Mobile-only logo */}
          <div className="mobile-logo">
            <img
              src={LOGO_URL}
              alt="CrimeGPT Logo"
            />
          </div>

          {/* Header */}
          <div className="form-header">
            <h2 className="form-title">Welcome Back, Officer</h2>
            <p className="form-subtitle">
              Please authenticate to access the secure network.
            </p>
          </div>

          {/* Form */}
          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Officer ID / Email Field */}
            <div className="field-group">
              <label className="field-label" htmlFor="officer_id">
                Officer ID or Email
              </label>
              <div className="field-input-wrapper">
                <span className="field-icon material-symbols-outlined">
                  badge
                </span>
                <input
                  id="officer_id"
                  name="officer_id"
                  type="text"
                  className="field-input"
                  placeholder="Enter your badge number or email"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  aria-required="true"
                  aria-invalid={submitted && !!errors.officerId}
                  aria-describedby={
                    submitted && errors.officerId ? 'officer_id_error' : undefined
                  }
                  autoComplete="username"
                />
              </div>
              {submitted && errors.officerId && (
                <p className="field-error" id="officer_id_error" role="alert">
                  {errors.officerId}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Secure Password
              </label>
              <div className="field-input-wrapper">
                <span className="field-icon material-symbols-outlined">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input field-input--password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-required="true"
                  aria-invalid={submitted && !!errors.password}
                  aria-describedby={
                    submitted && errors.password ? 'password_error' : undefined
                  }
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {submitted && errors.password && (
                <p className="field-error" id="password_error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Options Row */}
            <div className="options-row">
              <div className="remember-group">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="remember-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="remember-label" htmlFor="remember_me">
                  Remember this device
                </label>
              </div>
              <a className="forgot-link" href="#">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn">
              Login to CrimeGPT
            </button>
          </form>

          {/* Disclaimer Footer */}
          <div className="login-disclaimer">
            <p className="disclaimer-content">
              <span className="material-symbols-outlined">info</span>
              Authorized personnel only. All activity is logged and monitored.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
