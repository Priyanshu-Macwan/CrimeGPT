import React, { useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import NewCaseHeader from './NewCaseHeader';
import NewCase from './NewCase';
import './NewCase.css';

export default function NewCaseLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="new-case-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} theme="light" />

      <main className="main-content light-theme">
        <NewCaseHeader />

        <div className="new-case-body">
          <NewCase />
        </div>
      </main>
    </div>
  );
}
