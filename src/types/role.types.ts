// src/types/role.types.ts
export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleResponse {
  success: boolean;
  data?: Role;
  message?: string;
}

export interface RoleListResponse {
  success: boolean;
  data: Role[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}