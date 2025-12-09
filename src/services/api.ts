
// api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Generic helper to handle errors gracefully
const safeRequest = async <T>(request: Promise<any>): Promise<{ data?: T; error?: string }> => {
  try {
    const response = await request;
    return { data: response.data };
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Request failed' };
  }
};

export const getRoles = async () => {
  return safeRequest<any[]>(axios.get(`${API_BASE_URL}/roles`));
};

export const createRole = async (name: string, permissions: number[]) => {
  return safeRequest(axios.post(`${API_BASE_URL}/roles`, { name, permissions }));
};

export const getPermissions = async () => {
  return safeRequest<any[]>(axios.get(`${API_BASE_URL}/permissions`));
};

export const updateRole = async (id: string, name: string, permissions: number[]) => {
  return safeRequest(axios.put(`${API_BASE_URL}/roles/${id}`, { name, permissions }));
};

export const deleteRole = async (id: string) => {
  return safeRequest(axios.delete(`${API_BASE_URL}/roles/${id}`));
};
