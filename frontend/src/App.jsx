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

function App() {
  return <BrowserRouter><div className="App"><Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/dashboard" element={<DashboardLayout />} />
    <Route path="/cases" element={<MyCases />} />
    <Route path="/cases/:caseId" element={<CaseDetails />} />
    <Route path="/new-case" element={<NewCase />} />
    <Route path="/filing" element={<FIRFilingPage />} />
    <Route path="/evidence" element={<EvidencePage />} />
    <Route path="/reports" element={<ReportsPage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></div></BrowserRouter>;
}
export default App;
