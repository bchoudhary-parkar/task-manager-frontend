import axiosInstance from './axiosInstance';
import type { RoleListResponse, RoleResponse, Role } from '../types/role.types';

interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const roleApi = {
  getRoles: async (params?: GetRolesParams): Promise<RoleListResponse> => {
    const response = await axiosInstance.get<RoleListResponse>('/api/role', { params });
    return response.data;
  },

  getAllRoles: async (): Promise<{ success: boolean; data: Role[] }> => {
    const response = await axiosInstance.get('/api/role/all');
    return response.data;
  },

  getRoleById: async (id: string): Promise<RoleResponse> => {
    const response = await axiosInstance.get<RoleResponse>(`/api/role/${id}`);
    return response.data;
  },

  createRole: async (data: { name: string; description: string; permissions: number[] }): Promise<RoleResponse> => {
    const response = await axiosInstance.post<RoleResponse>('/api/role', data);
    return response.data;
  },

  updateRole: async (id: string, data: { name?: string; description?: string; permissions?: number[] }): Promise<RoleResponse> => {
    const response = await axiosInstance.put<RoleResponse>(`/api/role/${id}`, data); 
    return response.data;
  },

  deleteRole: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/api/role/${id}`); 
    return response.data;
  },
};

// Wrapper functions
export const getRoles = async (params?: GetRolesParams) => {
  try {
    const data = await roleApi.getRoles(params);
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.response?.data?.message || 'Failed to fetch roles' };
  }
};

export const getAllRoles = async () => {
  try {
    const data = await roleApi.getAllRoles();
    return { data: data.data, error: null };
  } catch (error: any) {
    return { data: null, error: error.response?.data?.message || 'Failed to fetch roles' };
  }
};

export const createRole = async (name: string, description: string, permissions: number[]) => {
  try {
    const data = await roleApi.createRole({ name, description, permissions });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.response?.data?.message || 'Failed to create role' };
  }
};

export const updateRole = async (id: string, name: string, description: string, permissions: number[]) => {
  try {
    const data = await roleApi.updateRole(id, { name, description, permissions });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.response?.data?.message || 'Failed to update role' };
  }
};

export const deleteRole = async (id: string) => {
  try {
    const data = await roleApi.deleteRole(id);
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.response?.data?.message || 'Failed to delete role' };
  }
};