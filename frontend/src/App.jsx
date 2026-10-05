import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import { AuthProvider, RequireAuth } from './Auth';

const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const MyCases = lazy(() => import('./components/cases/MyCases'));
const CaseDetails = lazy(() => import('./components/cases/CaseDetails'));
const NewCase = lazy(() => import('./components/filing/NewCase'));
const FIRFilingPage = lazy(() => import('./components/filing/FIRFilingPage'));
const EvidencePage = lazy(() => import('./components/evidence/EvidencePage'));
const ReportsPage = lazy(() => import('./components/reports/ReportsPage'));
const AdminPage = lazy(() => import('./components/reports/AdminPage'));

function App() {
  return <BrowserRouter><AuthProvider><div className="App"><Suspense fallback={<div className="work-body">Loading workspace…</div>}><Routes>
    <Route path="/" element={<LoginPage />} />
    <Route element={<RequireAuth />}>
    <Route path="/dashboard" element={<DashboardLayout />} />
    <Route path="/cases" element={<MyCases />} />
    <Route path="/cases/:caseId" element={<CaseDetails />} />
    <Route path="/new-case" element={<NewCase />} />
    <Route path="/filing" element={<FIRFilingPage />} />
    <Route path="/evidence" element={<EvidencePage />} />
    <Route path="/reports" element={<ReportsPage />} />
    </Route>
    <Route element={<RequireAuth role="admin" />}><Route path="/admin" element={<AdminPage />} /></Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></Suspense></div></AuthProvider></BrowserRouter>;
}
export default App;
