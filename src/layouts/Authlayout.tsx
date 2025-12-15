// src/layouts/AuthLayout.tsx
import React, { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="w-full flex flex-col overflow-y-auto p-2">
      {children}
    </div>
  );
};

export default AuthLayout;