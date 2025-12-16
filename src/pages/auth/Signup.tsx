import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Authlayout from '../../layouts/Authlayout';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import type { ValidationErrors } from '../../utils/validation';
import { validateSignupForm } from '../../utils/validation';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors & { general?: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showStrengthIndicator, setShowStrengthIndicator] = useState<boolean>(false);

  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateSignupForm(fullName, email, password);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authService.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      // MODIFIED: Check if verification is required
      if (response.requiresVerification) {
        // Redirect to verification page with email
        navigate('/verify-email', { 
          state: { email: email.trim().toLowerCase() } 
        });
        return;
      }

      // If no verification needed (shouldn't happen with new flow, but kept for safety)
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        navigate('/dashboard');
      } else {
        setErrors({ general: response.message || 'Signup failed' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      const requiresVerification = error.response?.data?.requiresVerification;
      const errorEmail = error.response?.data?.email;

      // NEW: Handle case where email exists but not verified
      if (requiresVerification && errorEmail) {
        setErrors({ 
          email: (
            <span>
              {errorMessage}{" "}
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
          <h3 className="text-3xl font-bold text-gray-800 text-center">Create an Account</h3>
          <p className="text-gray-600 mt-2 text-center">
            Join us today and start managing your tasks efficiently
          </p>
        </div>

        <div className="mb-6">
          <GoogleAuthButton mode="signup" />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSignUp} autoComplete="off" className="space-y-5">
          <div>
            <Input
              value={fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFullName(e.target.value);
                clearFieldError('name');
              }}
              label="Full Name"
              placeholder="John Doe"
              type="text"
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-2 font-medium">{errors.name}</p>
            )}
          </div>

          <div>
            <Input
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
              autoComplete="off"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-2 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                clearFieldError('password');
                setShowStrengthIndicator(true);
              }}
              label="Password"
              placeholder="Create a strong password"
              type="password"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-2 font-medium">{errors.password}</p>
            )}

            <PasswordStrengthIndicator
              password={password}
              show={showStrengthIndicator && !errors.password}
            />
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
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>

          <p className="text-sm text-gray-600 text-center pt-2">
            Already have an account?{" "}
            <Link className="font-semibold text-blue-600 hover:text-blue-700 underline" to="/login">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </Authlayout>
  );
};

export default Signup;