// src/constants/permissions.ts
// Create this new file

export const PERMISSIONS_MAP = {
  USER_MANAGEMENT: 1,
  TASK_MANAGEMENT: 2,
  ROLE_MANAGEMENT: 3,
  ALL: 4
} as const;

export type PermissionType = typeof PERMISSIONS_MAP[keyof typeof PERMISSIONS_MAP];

// Helper function to check if user has permission
export const checkPermission = (
  userPermissions: number[], 
  requiredPermission: number
): boolean => {
  return userPermissions.includes(requiredPermission) || 
         userPermissions.includes(PERMISSIONS_MAP.ALL);
};

export default PERMISSIONS_MAP;