import React from 'react';
import { MagnifyingGlass, Bell, Question, ShieldCheck } from '@phosphor-icons/react';

export default function NewCaseHeader() {
  return (
    <header className="new-case-header">
      <div className="search-bar light">
        <MagnifyingGlass weight="bold" />
        <input type="text" placeholder="Search records..." />
      </div>

      <div className="header-actions">
        <button className="icon-btn">
          <Bell weight="outline" />
        </button>
        <button className="icon-btn">
          <Question weight="outline" />
        </button>

        <div className="user-profile light">
          <div className="mini-logo">
            <ShieldCheck weight="fill" />
          </div>
          <span>OFF. PRIYANSHU</span>
        </div>
      </div>
    </header>
  );
}
