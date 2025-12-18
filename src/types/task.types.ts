// src/types/task.types.ts
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

// TaskUser interface for populated user objects in tasks
export interface TaskUser {
  _id: string;
  name: string;
  email: string;
  picture?: string; // Changed from photoUrl to match your API
  status?: 'available' | 'not available';
  role?: string | {
    _id: string;
    name: string;
    permissions: number[];
  };
}

// Main Task interface
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: TaskUser; // Can be user ID (string) OR populated user object
  createdBy: string | TaskUser;  // Can be user ID (string) OR populated user object
  dueDate?: string;
  tags: string[];
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

// DTOs for creating/updating tasks - these always use string IDs
export interface CreateTaskDTO {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  createdBy: string;  
  dueDate: string;
  tags?: string[];
  subtasks?: SubTask[];
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  _id?: string;
}

export interface TaskFilters {
  search?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

// Type guard to check if assignedTo/createdBy is a user object
export function isTaskUser(value: string | TaskUser): value is TaskUser {
  return typeof value === 'object' && value !== null && '_id' in value;
}

// Helper function to get user name from assignedTo/createdBy
export function getUserName(user: string | TaskUser | undefined | null, fallback: string = 'Unknown'): string {
  if (!user) return fallback;
  
  if (isTaskUser(user)) {
    return user.name;
  }
  
  return user; // It's a string (ID or name)
}

// Helper function to get user ID from assignedTo/createdBy
export function getUserId(user: string | TaskUser | undefined | null): string | undefined {
  if (!user) return undefined;
  
  if (isTaskUser(user)) {
    return user._id;
  }
  
  return user; // It's already a string ID
}