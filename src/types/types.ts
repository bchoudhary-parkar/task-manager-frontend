// src/types.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role?: {
    _id: string;
    name: string;
    permissions: number[];
  };
  status: 'available' | 'not available';
  photoUrl?: string;
  emailVerified?: boolean;
  permissions?: number[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  requiresVerification?: boolean;
  email?: string;
}