import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const getRoles = async () => {
  const response = await axios.get(`${API_BASE_URL}/roles`);
  return response.data;
};

export const createRole = async (name: string, permissions: number[]) => {
  const response = await axios.post(`${API_BASE_URL}/roles`, { name, permissions });
  return response.data;
};

export const getPermissions = async () => {
  const response = await axios.get(`${API_BASE_URL}/permissions`);
  return response.data;
};

export const updateRole = async (id: string, name: string, permissions: number[]) => {
  const response = await axios.put(`${API_BASE_URL}/roles/${id}`, { name, permissions });
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/roles/${id}`);
  return response.data;
};
