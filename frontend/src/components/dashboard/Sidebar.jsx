import React from 'react';
import { 
  SquaresFour, 
  FolderOpen, 
  FilePlus, 
  Robot, 
  MagnifyingGlass, 
  Files,
  WarningCircle
} from '@phosphor-icons/react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const go = (path) => navigate(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Robot weight="fill" /> CRIMEGPT
      </div>

      <ul className="nav-menu">
        <li className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => go('/dashboard')}>
          <SquaresFour weight="regular" /> Dashboard
        </li>
        <li className={`nav-item ${location.pathname === '/cases' ? 'active' : ''}`} onClick={() => go('/cases')}>
          <FolderOpen weight="regular" /> My Cases
        </li>
        <li className={`nav-item ${location.pathname === '/new-case' ? 'active' : ''}`} onClick={() => go('/new-case')}>
          <FilePlus weight="regular" /> New Case
        </li>
        <li className={`nav-item ${location.pathname === '/filing' ? 'active' : ''}`} onClick={() => go('/filing')}>
          <Robot weight="regular" /> AI FIR Generator
        </li>
        <li className={`nav-item ${location.pathname === '/evidence' ? 'active' : ''}`} onClick={() => go('/evidence')}>
          <MagnifyingGlass weight="regular" /> Evidence
        </li>
        <li className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`} onClick={() => go('/reports')}>
          <Files weight="regular" /> Reports
        </li>
      </ul>

      <div className="sidebar-footer">
        <button className="btn-emergency">
          <WarningCircle weight="bold" /> EMERGENCY ALERT
        </button>
        <span className="logout-link" onClick={() => navigate('/')}>
          LOGOUT SESSION
        </span>
      </div>
    </aside>
  );
}
