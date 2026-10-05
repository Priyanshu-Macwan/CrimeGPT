import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Robot, SquaresFour, FolderOpen, FilePlus, Sparkle, Images, Files, ShieldCheck } from '@phosphor-icons/react';
import { useAuth } from '../useAuth';
import './workspace.css';

const items = [
  ['/dashboard', 'Dashboard', SquaresFour], ['/cases', 'My Cases', FolderOpen],
  ['/new-case', 'New Case', FilePlus], ['/filing', 'FIR Drafts', Sparkle],
  ['/evidence', 'Evidence', Images], ['/reports', 'Reports', Files], ['/admin', 'Admin overview', ShieldCheck],
];

export default function WorkspaceShell({ children, title = 'CASE MANAGEMENT' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  return (
    <div className="workspace">
      <aside className="work-sidebar">
        <div className="work-brand"><Robot size={22} /> CRIMEGPT</div>
        <div className="work-unit">UNIT 7B · CENTRAL PRECINCT</div>
        <nav className="work-nav">
          {items.filter(([to]) => to !== '/admin' || user?.role === 'admin').map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}><Icon /> {label}</NavLink>)}
        </nav>
        <button className="work-logout" onClick={async () => { try { await logout(); navigate('/'); } catch { alert('Sign out failed. Please retry.'); } }}>↪ &nbsp; SIGN OUT</button>
      </aside>
      <main className="work-main">
        <header className="work-top">
          <strong>CRIMEGPT&nbsp; / &nbsp;{title}</strong>
          <div className="top-links">
            <NavLink to="/cases">RECORDS</NavLink><NavLink to="/evidence">EVIDENCE</NavLink>
            <NavLink to="/reports">REPORTS</NavLink><NavLink className="btn primary" to="/new-case">+ NEW CASE</NavLink>
          </div>
        </header>
        {children}
        <footer className="site-footer"><span>CrimeGPT · Law enforcement edition</span><span>Officer workspace · Unit 7B</span></footer>
      </main>
    </div>
  );
}
