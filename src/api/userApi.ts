// src/api/userApi.ts
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
    const response = await axiosInstance.get<UserResponse>(`/api/user/${id}`);
    return response.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    status?: 'available' | 'not available';
    role?: string;
    photoUrl?: string;
  }): Promise<UserResponse> => {
    const response = await axiosInstance.post<UserResponse>('/api/user', data);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<UserResponse> => {
    const response = await axiosInstance.put<UserResponse>(`/api/user/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/api/user/${id}`);
    return response.data;
  },
};