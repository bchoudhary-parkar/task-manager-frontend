// src/api/taskApi.ts
import axiosInstance from './axiosInstance';
import type {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
  TaskUser
} from '../types/task.types';
 
interface TaskListResponse {
  success: boolean;
  count?: number;
  data: Task[];
  message?: string;
}
 
interface TaskResponse {
  success: boolean;
  data: Task;
  message?: string;
}
 
interface UserListResponse {
  success: boolean;
  data: TaskUser[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
 
interface GetTasksParams {
  search?: string;
  assignedTo?: string;
  status?: string;
  priority?: string;
}
 
interface GetUsersForAssignmentParams {
  page?: number;
  limit?: number;
  search?: string;
}
 
export const taskApi = {
  // Get all tasks with optional filters
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    const params: GetTasksParams = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.assignedTo) params.assignedTo = filters.assignedTo;
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
 
    const response = await axiosInstance.get<TaskListResponse>('/api/tasks', { params });
    return response.data.data;
  },
 
  // Get single task by ID
  getTaskById: async (id: string): Promise<Task> => {
    const response = await axiosInstance.get<TaskResponse>(`/api/tasks/${id}`);
    return response.data.data;
  },
 
  // Create new task
  createTask: async (task: CreateTaskDTO): Promise<Task> => {
    const response = await axiosInstance.post<TaskResponse>('/api/tasks', task);
    return response.data.data;
  },
 
  // Update task
  updateTask: async (id: string, updates: Partial<UpdateTaskDTO>): Promise<Task> => {
    const response = await axiosInstance.put<TaskResponse>(`/api/tasks/${id}`, updates);
    return response.data.data;
  },
 
  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/tasks/${id}`);
  },
 
  // Bulk update task status (for drag and drop)
  bulkUpdateStatus: async (updates: Array<{ id: string; status: string }>): Promise<Task[]> => {
    const response = await axiosInstance.post<TaskListResponse>(
      '/api/tasks/bulk-update',
      { updates }
    );
    return response.data.data;
  },
 
  // Get users for task assignment (paginated, only available users)
  getUsersForAssignment: async (params?: GetUsersForAssignmentParams): Promise<TaskUser[]> => {
    const response = await axiosInstance.get<UserListResponse>('/api/tasks/users', { params });
    return response.data.data;
  },
};
 
export default taskApi;