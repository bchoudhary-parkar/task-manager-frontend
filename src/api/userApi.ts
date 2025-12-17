import axiosInstance from './axiosInstance';
import type { User, UserListResponse, UserResponse } from '../types/user.types';

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'available' | 'not available';
}

export const userApi = {
  getUsers: async (params?: GetUsersParams): Promise<UserListResponse> => {
    const response = await axiosInstance.get<UserListResponse>('/api/user', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await axiosInstance.get<UserResponse>(`/api/user/${id}`); // ✅ FIXED
    return response.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    status?: 'available' | 'not available';
    role?: string | null;
    picture?: string;
  }): Promise<UserResponse> => {
    const response = await axiosInstance.post<UserResponse>('/api/user', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<UserResponse> => {
    const response = await axiosInstance.put<UserResponse>(`/api/user/${id}`, data); // ✅ FIXED
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/api/user/${id}`); // ✅ FIXED
    return response.data;
  },
};

// Wrapper functions
export const fetchUsers = async (page: number = 1, limit: number = 10, search: string = '') => {
  const response = await userApi.getUsers({ page, limit, search });
  return {
    data: response.data,
    currentPage: response.pagination?.currentPage || response.currentPage || page,
    totalPages: response.pagination?.totalPages || response.totalPages || 1,
    totalItems: response.pagination?.totalItems || response.totalItems || 0,
  };
};

export const addUserApi = async (userData: any): Promise<User> => {
  const response = await userApi.createUser(userData);
  if (!response.data) {
    throw new Error(response.message || 'Failed to create user');
  }
  return response.data;
};

export const updateUserApi = async (id: string, updates: Partial<User>): Promise<User> => {
  const response = await userApi.updateUser(id, updates);
  if (!response.data) {
    throw new Error(response.message || 'Failed to update user');
  }
  return response.data;
};

export const deleteUserApi = async (id: string): Promise<void> => {
  await userApi.deleteUser(id);
};