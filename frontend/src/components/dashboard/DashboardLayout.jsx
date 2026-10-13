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
import { useRemoteData } from '../../useRemoteData';

export default function DashboardLayout() {
  const { data: caseData, loading: casesLoading, error: casesError } = useRemoteData('/cases', 'cases');
  const { data: draftData, loading: draftsLoading, error: draftsError } = useRemoteData('/drafts', 'drafts');
  const { data: activityData } = useRemoteData('/activity', 'activity');
  const cases = caseData || [];
  const drafts = draftData || [];
  const pendingDrafts = drafts.filter(draft => draft.status === 'pending_review');
  const openCases = cases.filter(item => item.status === 'Open' || item.status === 'Investigating').length;
  const solvedCases = cases.filter(item => item.status === 'Solved').length;
  return (
    <div className="dashboard-container">
      <Sidebar showEmergency />
      
      <main className="main-content">
        <Header />
        
        <div className="dashboard-body">
          {(casesError || draftsError) && <div className="form-error" role="alert">Dashboard data could not be fully loaded: {casesError || draftsError}</div>}
          {/* KPI Cards */}
          <div className="kpi-row">
            <StatCard title="Total Cases" value={casesLoading ? '…' : cases.length} icon={Briefcase} />
            <StatCard title="Open Cases" value={casesLoading ? '…' : openCases} icon={FileText} />
            <StatCard title="Solved Cases" value={casesLoading ? '…' : solvedCases} icon={CheckCircle} />
            <StatCard title="AI Drafts Pending" value={draftsLoading ? '…' : pendingDrafts.length} icon={Robot} />
          </div>

          {/* Middle Section */}
          <div className="content-split">
            <RecentCasesTable cases={cases} loading={casesLoading} />
            <AIDraftsPanel drafts={pendingDrafts} loading={draftsLoading} />
          </div>

          {/* Bottom Section */}
          <div className="bottom-split">
            <CrimeCategoriesChart cases={cases} />
            <ActivityTimeline activity={activityData || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
