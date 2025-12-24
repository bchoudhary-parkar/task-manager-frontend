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
  status: string | undefined;
}
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
 
  const permissions = user?.Permissions || user?.permissions || [];
  const status = user?.status;
 
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          if (response.user.status === 'not available') {
            console.warn('⚠️ User account is not available');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            window.location.href = '/login?reason=deactivated';
            return;
          }
         
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
       
      }
    } else {
      setIsLoading(false);
    }
  };
 
  const hasPermission = (permission: number): boolean => {
    return permissions.includes(permission) || permissions.includes(4);
  };
 
  useEffect(() => {
    refreshUser();
  }, []);
 
  useEffect(() => {
    if (!token || !user) return;
    const checkUserStatus = async () => {
      try {
        const response = await authApi.getCurrentUser();
       
        if (!response.success || !response.user) {
          console.warn('⚠️ User session invalid');
          logout();
          return;
        }
 
        if (response.user.status === 'not available') {
          console.warn('⚠️ User has been deactivated');
          alert('Your account has been deactivated. You will be logged out.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          window.location.href = '/login?reason=deactivated';
          return;
        }
         setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (error: any) {
        console.error('Status check failed:', error);
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          logout();
        }
      }
    };
 
    checkUserStatus();
 
    const interval = setInterval(checkUserStatus, 10000);
 
    return () => clearInterval(interval);
  }, [token, user?.id]);
 
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
        hasPermission,
        status,
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
 