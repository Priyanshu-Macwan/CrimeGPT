import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { request } from './api';
import { AuthContext } from './authContext';
import { useAuth } from './useAuth';

let sessionCheck;
function currentSession() {
  if (!sessionCheck) sessionCheck = request('/me').finally(() => { sessionCheck = null; });
  return sessionCheck;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    currentSession().then(result => { if (active) setUser(result.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function login(id, password) {
    const result = await request('/login', { method: 'POST', body: JSON.stringify({ id, password }) });
    setUser(result.user);
    return result.user;
  }
  async function logout() {
    await request('/logout', { method: 'POST' });
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="work-body">Checking session…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
