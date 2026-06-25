import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';
import { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem('access_token')
  );
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string) => {
    localStorage.setItem('access_token', t);
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    setTokenState(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      authApi.me()
        .then(me => { setUser(me); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [token, logout]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    setTokenState(res.access_token);
    const me = await authApi.me();
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
