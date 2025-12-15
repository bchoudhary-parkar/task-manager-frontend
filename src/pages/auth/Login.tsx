import React, { useState } from 'react';
import Authlayout from '../../layouts/Authlayout';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import type { ValidationErrors } from '../../utils/validation';
import { validateLoginForm } from '../../utils/validation';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors & { general?: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(email, password);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: email.trim().toLowerCase(),
        password
      });

      // NEW: Check if email verification is required
      if (response.requiresVerification) {
        navigate('/verify-email', { 
          state: { email: email.trim().toLowerCase() } 
        });
        return;
      }

      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        navigate('/dashboard');
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      const requiresVerification = error.response?.data?.requiresVerification;
      const errorEmail = error.response?.data?.email;

      // NEW: Handle verification required error
      if (requiresVerification && errorEmail) {
        setErrors({ 
          general: (
            <span>
              Please verify your email first.{" "}
              <Link 
                to="/verify-email" 
                state={{ email: errorEmail }}
                className="text-blue-600 hover:text-blue-700 underline font-semibold"
              >
                Verify now?
              </Link>
            </span>
          ) as any
        });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearFieldError = (field: keyof ValidationErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      delete newErrors.general;
      return newErrors;
    });
  };

  return (
    <Authlayout>
      <div className="max-w-md mx-auto w-full flex flex-col justify-center min-h-[calc(100vh-120px)] px-4 py-2 border border-gray-500 rounded-md shadow-md">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-800 text-center">Welcome Back</h3>
          <p className="text-gray-600 mt-2 text-center">
            Please enter your credentials to continue
          </p>
        </div>

        <div className="mb-6">
          <GoogleAuthButton mode="login" />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              label="Email Address"
              placeholder="john@example.com"
              type="email"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-2 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              label="Password"
              placeholder="Enter your password"
              type="password"
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-2 font-medium">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium">{errors.general}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </button>

          <p className="text-sm text-gray-600 text-center pt-2">
            Don't have an account?{" "}
            <Link className="font-semibold text-blue-600 hover:text-blue-700 underline" to="/signup">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </Authlayout>
  );
};

export default Login;