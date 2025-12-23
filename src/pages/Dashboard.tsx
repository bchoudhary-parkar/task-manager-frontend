// src/pages/Dashboard.tsx
import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Users, Shield, LayoutDashboard, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PERMISSIONS_MAP from '../constants/permissions';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission, permissions, isLoading } = useAuth();
  
  const allCards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/users',
      stats: 'View all users',
      requiredPermission: PERMISSIONS_MAP.USER_MANAGEMENT
    },
    {
      title: 'Role Management',
      description: 'Create and manage user roles',
      icon: Shield,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/roles',
      stats: 'Manage roles',
      requiredPermission: PERMISSIONS_MAP.ROLE_MANAGEMENT
    },
    {
      title: 'Task Management',
      description: 'View Task activity and logs',
      icon: Activity,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      path: '/tasks',
      stats: 'Task tracker',
      requiredPermission: PERMISSIONS_MAP.TASK_MANAGEMENT
    }
  ];

  // ✅ Use useMemo to recalculate when permissions change
  const visibleCards = useMemo(() => {
    const cards = allCards.filter(card => hasPermission(card.requiredPermission));
    return cards;
  }, [permissions, user]); // Recalculate when permissions or user changes

  // Debug effect - only logs when permissions actually change
  useEffect(() => {
    if (user && permissions.length > 0) {
    }
  }, [permissions.length]); // Only log when permission count changes

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-blue-100 mt-1">Here's what's happening with your system today</p>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Access</h2>
          {visibleCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => navigate(card.path)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className={`${card.color} ${card.hoverColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 shadow-md`}>
                      <card.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{card.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{card.stats}</span>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">No Modules Available</p>
              <p className="text-sm text-gray-400">
                You don't have permission to access any modules. Please contact your administrator for access.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;