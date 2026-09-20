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
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Robot weight="fill" /> CRIMEGPT
      </div>

      <ul className="nav-menu">
        <li className="nav-item active">
          <SquaresFour weight="regular" /> Dashboard
        </li>
        <li className="nav-item">
          <FolderOpen weight="regular" /> My Cases
        </li>
        <li className="nav-item">
          <FilePlus weight="regular" /> New Case
        </li>
        <li className="nav-item">
          <Robot weight="regular" /> AI FIR Generator
        </li>
        <li className="nav-item">
          <MagnifyingGlass weight="regular" /> Evidence
        </li>
        <li className="nav-item">
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
