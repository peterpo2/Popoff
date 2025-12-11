import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';
import { authTokenKey, httpClient } from '../api/httpClient';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthResponse {
  token: string;
  user?: User;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(authTokenKey);
    setToken(null);
    setUser(null);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await apiClient.getUser();
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch profile, logging out', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      const response = await httpClient.post<AuthResponse>(
        '/api/auth/login',
        { email, password },
        { skipAuth: true },
      );

      localStorage.setItem(authTokenKey, response.token);
      setToken(response.token);

      if (response.user) {
        setUser(response.user);
        setLoading(false);
        return;
      }

      await fetchProfile();
    },
    [fetchProfile],
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(authTokenKey);
    if (storedToken) {
      setToken(storedToken);
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
    }),
    [user, token, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
