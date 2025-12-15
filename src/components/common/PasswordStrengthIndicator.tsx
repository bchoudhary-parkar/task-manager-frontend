
// src/components/Auth/PasswordStrengthIndicator.tsx
// Minimal, professional checklist — uses isStrongPassword; no progress bars or badges.

import React, { useMemo } from 'react';
import { isStrongPassword } from '../../utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  show?: boolean;
  className?: string;
  title?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  show = true,
  className = '',
  title = 'Password requirements',
}) => {
  if (!show || !password) return null;

  // Compute once per change with your existing validator
  const strength = useMemo(() => isStrongPassword(password), [password]);

  // Mirror the exact rules used in utils/validation.ts
  const checks = [
    { label: 'At least 8 characters',  passed: password.length >= 8 },
    { label: 'One lowercase letter',   passed: /[a-z]/.test(password) },
    { label: 'One uppercase letter',   passed: /[A-Z]/.test(password) },
    { label: 'One number',             passed: /[0-9]/.test(password) },
    { label: 'One special character',  passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  return (
    <div
      className={`mt-2 rounded-md border border-gray-200 bg-white p-3 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 ${className}`}
      role="group"
      aria-label="Password requirements"
    >
      {/* Simple title only */}
      <p className="mb-2 font-medium text-gray-700 dark:text-gray-100">{title}</p>

      {/* Checklist — minimal and readable */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2">
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold
                ${c.passed ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}
              `}
              aria-hidden="true"
            >
              {c.passed ? '✓' : '–'}
            </span>
            <span className={`${c.passed ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Optional minimal success line */}
      {strength.isValid && (
        <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300">
          Password meets all requirements
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;