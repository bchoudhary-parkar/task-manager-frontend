const loadPermissions = (): Record<string, number> => {
  const rawPermissions = import.meta.env.VITE_PERMISSIONS || '';
  return rawPermissions.split(',').reduce((acc: Record<string, number>, item: string) => {
    const [key, value] = item.split(':');
    acc[key] = Number(value);
    return acc;
  }, {});
};

export const permissionsMap = loadPermissions();
