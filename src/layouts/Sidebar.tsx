// src/layouts/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Activity,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PERMISSIONS_MAP from '../constants/permissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  requiredPermission?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { hasPermission } = useAuth();

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Users',
      path: '/users',
      icon: Users,
      requiredPermission: PERMISSIONS_MAP.USER_MANAGEMENT
    },
    {
      title: 'Roles',
      path: '/roles',
      icon: Shield,
      requiredPermission: PERMISSIONS_MAP.ROLE_MANAGEMENT
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: Activity,
      requiredPermission: PERMISSIONS_MAP.TASK_MANAGEMENT
    }
  ];

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => 
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  return (
    <>
      {/* Backdrop Overlay - Only visible on mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Task Manager
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Task Manager
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;