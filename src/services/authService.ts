import { authApi } from '../api/authApi';
// import type { LoginCredentials, SignupCredentials, VerifyEmailCredentials } from '../types/auth.types';

export const authService = {
  register: authApi.register,
  login: authApi.login,
  googleAuth: authApi.googleAuth,
  getCurrentUser: authApi.getCurrentUser,
  verifyEmail: authApi.verifyEmail,
  resendOTP: authApi.resendOTP,
};