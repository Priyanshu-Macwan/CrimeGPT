import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCard from './StatCard';
import RecentCasesTable from './RecentCasesTable';
import AIDraftsPanel from './AIDraftsPanel';
import CrimeCategoriesChart from './CrimeCategoriesChart';
import ActivityTimeline from './ActivityTimeline';

/**
 * DashboardLayout — Root layout for the officer dashboard.
 * Manages sidebar toggle state and orchestrates the grid layout
 * matching the brutalist cream/navy aesthetic from screen.png.
 */

const statCards = [
  { title: 'Total Cases', value: '47', icon: 'folder_copy' },
  { title: 'Open Cases', value: '12', icon: 'lock_open' },
  { title: 'Solved Cases', value: '31', icon: 'check_circle' },
  { title: 'AI Drafts Pending', value: '4', icon: 'description', isHighlighted: true },
];

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-bureau-bg text-bureau-navy h-screen flex overflow-hidden font-body-md">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <main className="lg:ml-64 flex-1 flex flex-col h-screen overflow-hidden bg-bureau-bg">
        {/* Top Navigation Bar */}
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-gutter space-y-gutter">
          {/* Row 1: Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            {statCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                isHighlighted={card.isHighlighted}
              />
            ))}
          </div>

          {/* Row 2: Recent Cases Table + AI Drafts Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <RecentCasesTable />
            <AIDraftsPanel />
          </div>

          {/* Row 3: Crime Categories Chart + Activity Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter pb-gutter">
            <CrimeCategoriesChart />
            <ActivityTimeline />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
