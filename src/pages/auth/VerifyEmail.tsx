import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Authlayout from '../../layouts/Authlayout';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const VerifyEmail: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      // If no email in state, redirect to signup
      navigate('/signup');
    }
  }, [location, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    setError("");

    // Focus next input
    if (element.value && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = (e.target as HTMLInputElement).previousSibling as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pasteData.length; i++) {
      if (!isNaN(Number(pasteData[i]))) {
        newOtp[i] = pasteData[i];
      }
    }
    
    setOtp(newOtp);
    setError("");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authService.verifyEmail({
        email,
        code: otpCode
      });

      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        setSuccess("Email verified successfully! Redirecting...");
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid or expired verification code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.resendOTP(email);

      if (response.success) {
        setSuccess("Verification code sent! Check your email.");
        setTimeLeft(600); // Reset timer
        setCanResend(false);
        setResendCooldown(60); // 60 second cooldown
        setOtp(new Array(6).fill(""));
        
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.message || 'Failed to resend code');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification code';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Authlayout>
      <div className="max-w-md mx-auto w-full flex flex-col justify-center min-h-[calc(100vh-120px)] px-4 py-2 border border-gray-500 rounded-md shadow-md">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">Verify Your Email</h3>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-blue-600 font-semibold mt-1">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm font-medium text-center">{success}</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            {timeLeft > 0 ? (
              <p>Code expires in <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span></p>
            ) : (
              <p className="text-red-600 font-medium">Code expired</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || otp.join("").length !== 6}
          >
            {isLoading ? 'VERIFYING...' : 'VERIFY EMAIL'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || resendCooldown > 0}
                  className="font-semibold text-blue-600 hover:text-blue-700 underline disabled:text-gray-400 disabled:no-underline"
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>

          <div className="text-center pt-2">
            <Link 
              to="/signup" 
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Sign Up
            </Link>
          </div>
        </form>
      </div>
    </Authlayout>
  );
};

export default VerifyEmail;