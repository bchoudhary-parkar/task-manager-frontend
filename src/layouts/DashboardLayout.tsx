// src/layouts/DashboardLayout.tsx
import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user!} onLogout={logout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-7">   
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

// max-w-7xl mx-auto px-4 sm:px-6 lg:p-7
