
// src/context/AuthContext.tsx
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get permissions from user
  const permissions = user?.permissions || user?.role?.permissions || [];

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          const response = await authApi.getCurrentUser();

          if (response.success && response.user) {
            setUser(response.user);
            setToken(storedToken);
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

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, isLoading, permissions, logout }}>
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
