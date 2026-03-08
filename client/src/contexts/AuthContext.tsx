'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/lib/types';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  googleLogin: (tokenId: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('classivo_token');
      localStorage.removeItem('classivo_user');
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('classivo_token');
    const storedUser = localStorage.getItem('classivo_user');
    if (stored) {
      setToken(stored);
      if (storedUser) setUser(JSON.parse(storedUser));
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('classivo_token', token);
    localStorage.setItem('classivo_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  };

  const googleLogin = async (tokenId: string): Promise<User> => {
    const res = await api.post('/auth/google', { tokenId });
    const { token, user } = res.data;
    localStorage.setItem('classivo_token', token);
    localStorage.setItem('classivo_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('classivo_token');
    localStorage.removeItem('classivo_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
