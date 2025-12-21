// src/routes/AppRoutes.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import PERMISSIONS_MAP from '../constants/permissions';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import VerifyEmail from '../pages/auth/VerifyEmail';

// Dashboard Pages
import Dashboard from '../pages/Dashboard';
import RoleManagement from '../pages/RoleManagementPage';
import UserManagement from '../pages/UserManagement';
import TaskManagementPage from '../pages/TaskManagement';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<PublicRoute children={<Login />} />}
        />
        <Route
          path="/signup"
          element={<PublicRoute children={<Signup />} />}
        />
        <Route
          path="/verify-email"
          element={<PublicRoute children={<VerifyEmail />} />}
        />

        {/* Protected Routes - Dashboard has no permission requirement */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute children={<Dashboard />} />}
        />

        {/* Protected Routes with Permission Requirements */}
        <Route
          path="/roles"
          element={
            <ProtectedRoute 
              requiredPermission={PERMISSIONS_MAP.ROLE_MANAGEMENT}
              children={<RoleManagement />}
            />
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute 
              requiredPermission={PERMISSIONS_MAP.USER_MANAGEMENT}
              children={<UserManagement />}
            />
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute 
              requiredPermission={PERMISSIONS_MAP.TASK_MANAGEMENT}
              children={<TaskManagementPage />}
            />
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;