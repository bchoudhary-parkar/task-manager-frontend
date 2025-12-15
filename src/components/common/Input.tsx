
import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  type = 'text',
  autoComplete
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const isPassword = type === 'password';
  const toggleShowPassword = () => setShowPassword((s) => !s);

  const getAutoCompleteValue = () => {
    if (autoComplete) return autoComplete;
    if (type === 'email') return 'email';
    if (type === 'password') return 'new-password';
    return 'off';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="input-box">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm"
          value={value}
          onChange={onChange}
          autoComplete={getAutoCompleteValue()}
          name={type === 'password' ? 'new-password' : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="text-gray-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;