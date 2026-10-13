import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import { request } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    request('/me')
      .then(({ user: currentUser }) => { if (active) setUser(currentUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(id, password) {
      const result = await request('/login', { method: 'POST', body: { id, password } });
      setUser(result.user);
      return result.user;
    },
    async logout() {
      try { await request('/logout', { method: 'POST' }); }
      finally { setUser(null); }
    },
  }), [user, loading]);

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
