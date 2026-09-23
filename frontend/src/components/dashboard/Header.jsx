import React from 'react';
import { MagnifyingGlass, Bell, Robot } from '@phosphor-icons/react';

export default function Header() {
  return (
    <header className="top-header">
      <div className="header-greeting">
        <h2>Good Morning, Officer Priyanshu</h2>
        <div className="badge-number">Badge #4892</div>
      </div>
      
      <div className="header-actions">
        <div className="search-bar">
          <MagnifyingGlass weight="bold" />
          <input type="text" placeholder="Search case ID, name..." />
        </div>
        
        <button className="notification-btn">
          <Bell weight="regular" />
          <span className="notification-dot"></span>
        </button>
        
        <div className="header-logo-badge">
          <Robot weight="fill" /> CRIMEGPT
        </div>
      </div>
    </header>
  );
}
