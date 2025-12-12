import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Generic helper to handle errors gracefully
const safeRequest = async <T>(request: Promise<any>): Promise<{ data?: T; error?: string }> => {
  try {
    const response = await request;
    // Return the entire response.data which contains {success, data, pagination}
    return { data: response.data };
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Request failed' };
  }
};

// Get roles with pagination and search
export const getRoles = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const url = queryParams.toString() 
    ? `${API_BASE_URL}/roles?${queryParams.toString()}`
    : `${API_BASE_URL}/roles`;

  return safeRequest<any>(axios.get(url));
};

// Create role with description
export const createRole = async (name: string, description: string, permissions: number[]) => {
  return safeRequest(axios.post(`${API_BASE_URL}/roles`, { name, description, permissions }));
};

// Get permissions
export const getPermissions = async () => {
  return safeRequest<any[]>(axios.get(`${API_BASE_URL}/permissions`));
};

// Update role with description
export const updateRole = async (id: string, name: string, description: string, permissions: number[]) => {
  return safeRequest(axios.put(`${API_BASE_URL}/roles/${id}`, { name, description, permissions }));
};

// Delete role
export const deleteRole = async (id: string) => {
  return safeRequest(axios.delete(`${API_BASE_URL}/roles/${id}`));
};