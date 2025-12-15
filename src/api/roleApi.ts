// src/api/roleApi.ts
import axiosInstance from './axiosInstance';
import type { RoleListResponse, RoleResponse } from '../types/role.types';

interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const roleApi = {
  getRoles: async (params?: GetRolesParams): Promise<RoleListResponse> => {
    const response = await axiosInstance.get<RoleListResponse>('/api/role/roles', { params });
    return response.data;
  },

  getRoleById: async (id: string): Promise<RoleResponse> => {
    const response = await axiosInstance.get<RoleResponse>(`/api/role/roles/${id}`);
    return response.data;
  },

  createRole: async (data: { name: string; description: string; permissions: number[] }): Promise<RoleResponse> => {
    const response = await axiosInstance.post<RoleResponse>('/api/role/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: { name?: string; description?: string; permissions?: number[] }): Promise<RoleResponse> => {
    const response = await axiosInstance.put<RoleResponse>(`/api/role/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/api/role/roles/${id}`);
    return response.data;
  },
};