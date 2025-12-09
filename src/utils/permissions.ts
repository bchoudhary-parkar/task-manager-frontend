const loadPermissions = (): Record<string, number> => {
  const rawPermissions = import.meta.env.VITE_PERMISSIONS || '';
  return rawPermissions.split(',').reduce((acc: Record<string, number>, item: string) => {
    const [key, value] = item.split(':');
    acc[key] = Number(value);
    return acc;
  }, {});
};

export const permissionsMap = loadPermissions();

// Converts "user_management" -> "User Management"
export const formatPermissionName = (permissionKey: string): string => {
  return permissionKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get permission name by code with formatting
export const getFormattedPermissionName = (code: number): string | undefined => {
  const key = Object.keys(permissionsMap).find(k => permissionsMap[k] === code);
  return key ? formatPermissionName(key) : undefined;
};