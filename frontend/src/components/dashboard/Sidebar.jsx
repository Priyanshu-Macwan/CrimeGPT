import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Robot,
  SquaresFour,
  FolderOpen,
  FilePlus,
  Sparkle,
  Images,
  Files,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import { useAuth } from '../../authContext';

const navigation = [
  ['/dashboard', 'Dashboard', SquaresFour],
  ['/cases', 'My Cases', FolderOpen],
  ['/new-case', 'New Case', FilePlus],
  ['/filing', 'AI FIR Generator', Sparkle],
  ['/evidence', 'Evidence', Images],
  ['/reports', 'Reports', Files],
  ['/admin', 'Admin', ShieldCheck],
];

export default function Sidebar({ showEmergency = false }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function signOut() {
    try { await logout(); }
    finally { navigate('/', { replace: true }); }
  }

  return (
    <aside className="work-sidebar">
      <div className="work-brand"><Robot size={22} weight="fill" /> CRIMEGPT</div>
      <div className="work-unit">{user?.id || 'OFFICER'} · {user?.role?.toUpperCase()}</div>
      <nav className="work-nav" aria-label="Main navigation">
        {navigation.filter(([to]) => to !== '/admin' || user?.role === 'admin').map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to !== '/cases'} className={({ isActive }) => isActive ? 'active' : ''}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>
      {showEmergency && <button className="dashboard-sidebar-alert" type="button"><WarningCircle weight="bold" /> Emergency Alert</button>}
      <button className="work-logout" onClick={signOut}>↪ &nbsp; SIGN OUT</button>
    </aside>
  );
}
