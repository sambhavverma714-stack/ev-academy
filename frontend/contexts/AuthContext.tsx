'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { setAuthToken, getAuthToken, removeAuthToken, setUserInStorage, getUserFromStorage, clearAuthStorage } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requiresVerification?: boolean; emailDelivery?: { sent?: boolean; dev?: boolean; throttled?: boolean } | null }>;
  register: (name: string, email: string, password: string) => Promise<{ emailDelivery?: { sent?: boolean; dev?: boolean } | null; requiresVerification?: boolean; emailVerificationEnabled?: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getUserFromStorage();

    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setAuthToken(response.token);
    setUserInStorage(response.user);
    setUser(response.user);
    return { requiresVerification: response.requiresVerification, emailDelivery: response.emailDelivery };
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register(name, email, password);
    setAuthToken(response.token);
    setUserInStorage(response.user);
    setUser(response.user);
    return {
      emailDelivery: response.emailDelivery,
      requiresVerification: response.requiresVerification,
      emailVerificationEnabled: response.emailVerificationEnabled,
    };
  };

  const logout = () => {
    removeAuthToken();
    clearAuthStorage();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.me();
      setUserInStorage(response.user);
      setUser(response.user);
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
