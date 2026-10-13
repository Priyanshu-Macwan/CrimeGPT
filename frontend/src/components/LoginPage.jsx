import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldStar, Fingerprint, FileText, Scales, Crosshair, IdentificationCard,
  Lock, Eye, EyeSlash, Info,
} from '@phosphor-icons/react';
import { useAuth } from '../authContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(event) {
    event.preventDefault();
    setIsAuthenticating(true);
    setError('');
    try {
      await login(officerId.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError.status === 401
        ? 'Officer ID or password is incorrect.'
        : `${loginError.message}. Check that the backend is running.`);
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <div className="split-container">
      <section className="panel-left">
        <div className="watermark-badge"><ShieldStar weight="regular" /></div>
        <header className="logo"><Fingerprint weight="fill" /> CRIMEGPT</header>
        <div className="left-content">
          <h1 className="distressed-headline">AI-POWERED CRIME<br />DOCUMENTATION</h1>
          <p className="subtext">PRECISION, SPEED, AND SECURITY.</p>
          <ul className="feature-list">
            <li><FileText weight="regular" /><span>FIR Generation</span></li>
            <li><Scales weight="regular" /><span>Legal Sections</span></li>
            <li><Crosshair weight="regular" /><span>Case Tracking</span></li>
          </ul>
        </div>
        <footer className="panel-footer">NEXUS AI SYSTEMS &bull; LAW ENFORCEMENT EDITION</footer>
      </section>

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
                <input id="officer-id" type="text" autoComplete="username" placeholder="Enter ID or Email" required value={officerId} onChange={event => setOfficerId(event.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="password">SECURE PASSWORD</label>
              <div className="input-wrapper">
                <Lock className="icon" weight="regular" />
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter Password" required value={password} onChange={event => setPassword(event.target.value)} />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(value => !value)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeSlash weight="regular" /> : <Eye weight="regular" />}
                </button>
              </div>
            </div>
            <div className="form-options">
              <span className="remember-me">Secure session · expires after 8 hours</span>
              <button type="button" className="forgot-link" onClick={() => setError('Contact your CrimeGPT administrator to reset your password.')}>Forgot Password?</button>
            </div>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button type="submit" className="btn-primary" disabled={isAuthenticating} style={{ opacity: isAuthenticating ? 0.8 : 1 }}>
              {isAuthenticating ? 'AUTHENTICATING...' : 'LOGIN TO CRIMEGPT'}
            </button>
          </form>
          <div className="security-warning"><Info weight="fill" /><p>Authorized personnel only. All activity is logged and monitored.</p></div>
        </div>
      </section>
    </div>
  );
}
