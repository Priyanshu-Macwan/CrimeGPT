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
    <div className="bg-bureau-bg text-bureau-navy min-h-screen font-body-md">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area — offset by sidebar width on lg+ */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-gutter space-y-4 md:space-y-gutter">
          {/* Row 1: Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-md">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-gutter">
            <RecentCasesTable />
            <AIDraftsPanel />
          </div>

          {/* Row 3: Crime Categories Chart + Activity Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-gutter pb-4 md:pb-gutter">
            <CrimeCategoriesChart />
            <ActivityTimeline />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
