// src/routes/AppRoutes.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import VerifyEmail from '../pages/auth/VerifyEmail';

// Dashboard Pages
import Dashboard from '../pages/Dashboard';
import RoleManagement from '../pages/RoleManagementPage';
import UserManagement from '../pages/UserManagement';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <RoleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;