import React from 'react';
import { FileText, Briefcase, CheckCircle, Robot } from '@phosphor-icons/react';
import './Dashboard.css';

import Sidebar from './Sidebar';
import Header from './Header';
import StatCard from './StatCard';
import RecentCasesTable from './RecentCasesTable';
import AIDraftsPanel from './AIDraftsPanel';
import CrimeCategoriesChart from './CrimeCategoriesChart';
import ActivityTimeline from './ActivityTimeline';

export default function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <Header />
        
        <div className="dashboard-body">
          {/* KPI Cards */}
          <div className="kpi-row">
            <StatCard title="Total Cases" value="1,248" icon={Briefcase} />
            <StatCard title="Open Cases" value="342" icon={FileText} />
            <StatCard title="Solved Cases" value="891" icon={CheckCircle} />
            <StatCard title="AI Drafts Pending" value="14" icon={Robot} />
          </div>

          {/* Middle Section */}
          <div className="content-split">
            <RecentCasesTable />
            <AIDraftsPanel />
          </div>

          {/* Bottom Section */}
          <div className="bottom-split">
            <CrimeCategoriesChart />
            <ActivityTimeline />
          </div>
        </div>
      </main>
    </div>
  );
}
