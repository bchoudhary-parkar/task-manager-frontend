// src/types/user.types.ts
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

export interface UserResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
}