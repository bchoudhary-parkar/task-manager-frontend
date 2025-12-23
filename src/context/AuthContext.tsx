import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth.types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
  permissions: number[];
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const permissions = user?.Permissions || user?.permissions || [];

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        setIsLoading(true);
        const response = await authApi.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
          // 🚨 Proactive guard: if server says inactive, logout immediately
          const status = (response.user as any)?.status;
          if (status === 'not available') {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            window.location.href = '/login?reason=deactivated';
            return;
          }
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const hasPermission = (permission: number): boolean => {
    return permissions.includes(permission) || permissions.includes(4);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
            setToken(storedToken);
            const status = (response.user as any)?.status;
            if (status === 'not available') {
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
              window.location.href = '/login?reason=deactivated';
              return;
            }
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // (Reserved for future logic)
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          setToken(e.newValue);
          refreshUser();
        } else {
          logout();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        isLoading,
        permissions,
        logout,
        refreshUser,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};