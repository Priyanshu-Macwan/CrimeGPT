import { useState } from 'react';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';

/**
 * App Root
 *
 * Simple auth-gated flow:
 *   1. LoginPage renders first
 *   2. On successful login → switches to DashboardLayout
 *
 * No router needed — state-driven page switch.
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return <DashboardLayout />;
}

export default App;
