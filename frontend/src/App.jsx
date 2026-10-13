import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import MyCases from './components/cases/MyCases';
import CaseDetails from './components/cases/CaseDetails';
import NewCase from './components/filing/NewCase';
import FIRFilingPage from './components/filing/FIRFilingPage';
import EvidencePage from './components/evidence/EvidencePage';
import ReportsPage from './components/reports/ReportsPage';
import AdminPage from './components/reports/AdminPage';
import './components/workspace.css';
import { AuthProvider, useAuth } from './authContext';

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Checking secure session…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Checking secure session…</div>;
  return user ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function App() {
  return <AuthProvider><BrowserRouter><div className="App"><Routes>
    <Route path="/" element={<LoginRoute />} />
    <Route path="/dashboard" element={<Protected><DashboardLayout /></Protected>} />
    <Route path="/cases" element={<Protected><MyCases /></Protected>} />
    <Route path="/cases/:caseId" element={<Protected><CaseDetails /></Protected>} />
    <Route path="/new-case" element={<Protected><NewCase /></Protected>} />
    <Route path="/filing" element={<Protected><FIRFilingPage /></Protected>} />
    <Route path="/evidence" element={<Protected><EvidencePage /></Protected>} />
    <Route path="/reports" element={<Protected><ReportsPage /></Protected>} />
    <Route path="/admin" element={<Protected adminOnly><AdminPage /></Protected>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></div></BrowserRouter></AuthProvider>;
}
export default App;
