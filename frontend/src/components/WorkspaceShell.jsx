import React from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from './dashboard/Sidebar';
import { useAuth } from '../authContext';

export default function WorkspaceShell({ children, title = 'CASE MANAGEMENT' }) {
  const { user } = useAuth();
  return (
    <div className="workspace">
      <Sidebar />
      <main className="work-main">
        <header className="work-top">
          <strong>CRIMEGPT&nbsp; / &nbsp;{title}</strong>
          <div className="top-links">
            <NavLink to="/cases">RECORDS</NavLink><NavLink to="/evidence">EVIDENCE</NavLink>
            <NavLink to="/reports">REPORTS</NavLink><NavLink className="btn primary" to="/new-case">+ NEW CASE</NavLink>
          </div>
        </header>
        {children}
        <footer className="site-footer"><span>CrimeGPT · Law enforcement edition</span><span>{user?.id || 'Officer workspace'} · {user?.role || 'Officer'}</span></footer>
      </main>
    </div>
  );
}
