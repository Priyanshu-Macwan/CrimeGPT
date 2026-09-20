import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldStar,
  Fingerprint,
  FileText,
  Scales,
  Crosshair,
  IdentificationCard,
  Lock,
  Eye,
  EyeSlash,
  Info,
} from '@phosphor-icons/react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="split-container">
      {/* Left Panel: Dark Navy */}
      <section className="panel-left">
        <div className="watermark-badge">
          <ShieldStar weight="regular" />
        </div>

        <header className="logo">
          <Fingerprint weight="fill" /> CRIMEGPT
        </header>

        <div className="left-content">
          <h1 className="distressed-headline">
            AI-POWERED CRIME<br />
            DOCUMENTATION
          </h1>
          <p className="subtext">PRECISION, SPEED, AND SECURITY.</p>

          <ul className="feature-list">
            <li>
              <FileText weight="regular" />
              <span>FIR Generation</span>
            </li>
            <li>
              <Scales weight="regular" />
              <span>Legal Sections</span>
            </li>
            <li>
              <Crosshair weight="regular" />
              <span>Case Tracking</span>
            </li>
          </ul>
        </div>

        <footer className="panel-footer">
          NEXUS AI SYSTEMS &bull; LAW ENFORCEMENT EDITION
        </footer>
      </section>

      {/* Right Panel: Light Cream */}
      <section className="panel-right">
        <div className="login-wrapper">
          <div className="login-header">
            <h2>Welcome Back, Officer</h2>
            <p>Please authenticate to access the secure network.</p>
          </div>

          <form id="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="officer-id">OFFICER ID OR EMAIL</label>
              <div className="input-wrapper">
                <IdentificationCard className="icon" weight="regular" />
                <input
                  type="text"
                  id="officer-id"
                  placeholder="Enter ID or Email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">SECURE PASSWORD</label>
              <div className="input-wrapper">
                <Lock className="icon" weight="regular" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeSlash weight="regular" />
                  ) : (
                    <Eye weight="regular" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember this device
              </label>
              <a href="#" className="forgot-link">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ opacity: isAuthenticating ? 0.8 : 1 }}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'AUTHENTICATING...' : 'LOGIN TO CRIMEGPT'}
            </button>
          </form>

          <div className="security-warning">
            <Info weight="fill" />
            <p>Authorized personnel only. All activity is logged and monitored.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
