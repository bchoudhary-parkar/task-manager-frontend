// src/types/auth.types.ts
 
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  picture?: string;
  emailVerified?: boolean;
  isGoogleAuth?: boolean;
  role?: {
    _id: string;
    name: string;
    permissions: number[];
  };
  Permissions?: number[];
  permissions?: number[];
  status?: 'available' | 'not available';
  photoUrl?: string;
}
 
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  requiresVerification?: boolean;
  email?: string;
  userId?: string;
}
 
export interface LoginCredentials {
  email: string;
  password: string;
}
 
export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}
 
export interface VerifyEmailCredentials {
  email: string;
  code: string;
  otp?: string; // Some implementations use 'otp' instead of 'code'
}
 