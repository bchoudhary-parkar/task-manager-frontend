// src/pages/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Users, Shield, LayoutDashboard, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
 
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const cards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/users',
      stats: 'View all users'
    },
    {
      title: 'Role Management',
      description: 'Create and manage user roles',
      icon: Shield,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/roles',
      stats: 'Manage roles'
    },
    {
      title: 'Task Management',
      description: 'View Task activity and logs',
      icon: Activity,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      path: '/tasks',
      stats: 'Coming soon'
    }
  ];
 
  return (
    <DashboardLayout>
      <div className="space-y-8">
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
          <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
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
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
 
export default Dashboard;
 