// src/routes/AppRoutes.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

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
        {/* Public Routes - Redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute children={<Login />} />
            }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute children={<Signup />} />
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicRoute children={ <VerifyEmail />}/>
          }
        />

        {/* Protected Routes - All wrapped with DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute children={<Dashboard/>}/>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute children={<RoleManagement />}/>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute children={<UserManagement />} />                
          }
        />
        <Route
          path="/tasks"
          element={<ProtectedRoute children={<TaskManagementPage />} />}
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;