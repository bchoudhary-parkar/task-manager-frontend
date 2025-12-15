// src/api/authApi.ts
import axiosInstance from './axiosInstance';
import type { 
  AuthResponse, 
  LoginCredentials, 
  SignupCredentials,
  VerifyEmailCredentials 
} from '../types/auth.types';

export const authApi = {
  register: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/user/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/user/login', credentials);
    return response.data;
  },

  googleAuth: async (code: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/user/google-auth', { code });
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>('/api/user/profile');
    return response.data;
  },

  verifyEmail: async (credentials: VerifyEmailCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/user/verify-email', credentials);
    return response.data;
  },

  resendOTP: async (email: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/user/resend-otp', { email });
    return response.data;
  },
};