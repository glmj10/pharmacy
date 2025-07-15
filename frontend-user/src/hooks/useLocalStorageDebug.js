import { useEffect } from 'react';
import { localStorageUtils } from '../utils/localStorage';

/**
 * Hook to debug localStorage issues in development
 */
export const useLocalStorageDebug = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Check localStorage availability
      if (!localStorageUtils.isAvailable()) {
        console.warn('localStorage is not available');
        return;
      }

      // Check for corrupted data
      const checkItem = (key) => {
        try {
          const item = localStorage.getItem(key);
          if (item && (item === 'undefined' || item === 'null')) {
            console.warn(`Found corrupted ${key} in localStorage:`, item);
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.error(`Error checking localStorage item ${key}:`, error);
        }
      };

      checkItem('user');
      checkItem('token');

      // Log current auth state
      const user = localStorageUtils.getJSON('user');
      const token = localStorageUtils.getItem('token');
      
      console.log('🔐 Auth Debug Info:', {
        user: user ? 'Found' : 'Not found',
        token: token ? 'Found' : 'Not found',
        userType: typeof user,
        tokenType: typeof token
      });
    }
  }, []);
};

export default useLocalStorageDebug;
