// src/hooks/useUserUpdate.ts


import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to handle user updates that affect permissions
 * Call this after assigning roles or updating user permissions
 */
export const useUserUpdate = () => {
  const { refreshUser } = useAuth();

  const handleUserUpdate = useCallback(async () => {
    try {
      await refreshUser();
      console.log('User data refreshed after update');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [refreshUser]);

  return { handleUserUpdate };
};

export default useUserUpdate;