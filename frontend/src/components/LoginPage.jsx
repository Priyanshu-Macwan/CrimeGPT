import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
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
  const [error, setError] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');
    try {
      await login(officerId, password);
      navigate('/dashboard');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setIsAuthenticating(false);
    }
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
            SECURE CRIME<br />
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
          CRIMEGPT &bull; LAW ENFORCEMENT WORKSPACE
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
              <label htmlFor="officer-id">OFFICER ID</label>
              <div className="input-wrapper">
                <IdentificationCard className="icon" weight="regular" />
                <input
                  type="text"
                  id="officer-id"
                  autoComplete="username"
                  value={officerId}
                  onChange={event => setOfficerId(event.target.value)}
                  placeholder="Enter officer ID"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
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
              <span>Sessions expire after eight hours.</span>
              <span className="forgot-link">Contact your administrator for account recovery.</span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ opacity: isAuthenticating ? 0.8 : 1 }}
              disabled={isAuthenticating || loading}
            >
              {isAuthenticating ? 'AUTHENTICATING...' : 'LOGIN TO CRIMEGPT'}
            </button>
          </form>
          {error && <p role="alert" className="form-error">{error}</p>}

          <div className="security-warning">
            <Info weight="fill" />
            <p>Authorized personnel only. Case changes and draft approvals are logged.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
