import { useState, useEffect } from 'react';
import { useAuth } from '../components/common/ProtectedRoute';
import userService from '../services/user.service';
import { storage, TOKEN_KEYS } from '../utils/storage';
import { 
  addUserInfoUpdateListener, 
  addUserInfoClearListener,
  dispatchUserInfoUpdated,
  dispatchUserInfoCleared 
} from '../utils/userInfoEvents';

/**
 * Hook để lấy thông tin user hiện tại từ API
 */
export const useCurrentUser = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchUserInfo = async () => {
    if (!isAuthenticated) {
      setUserInfo(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getCurrentUser();
      
      if (response.status === 200 && response.data) {
        setUserInfo(response.data);
        // Cache user info
        storage.set('currentUserInfo', response.data);
      } else {
        throw new Error(response.message || 'Không thể lấy thông tin người dùng');
      }
    } catch (err) {
      console.log('Error fetching user info:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải thông tin người dùng');
      
      // Try to get cached user info
      const cachedUserInfo = storage.get('currentUserInfo');
      if (cachedUserInfo) {
        setUserInfo(cachedUserInfo);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUserInfo = () => {
    fetchUserInfo();
  };

  const updateUserInfo = (newUserInfo) => {
    setUserInfo(newUserInfo);
    storage.set('currentUserInfo', newUserInfo);
    // Dispatch event to notify other components
    dispatchUserInfoUpdated(newUserInfo);
  };

  const clearUserInfo = () => {
    setUserInfo(null);
    storage.remove('currentUserInfo');
    // Dispatch event to notify other components
    dispatchUserInfoCleared();
  };

  // Fetch user info when component mounts or auth status changes
  useEffect(() => {
    fetchUserInfo();
  }, [isAuthenticated]);

  // Get cached user info on mount
  useEffect(() => {
    const cachedUserInfo = storage.get('currentUserInfo');
    if (cachedUserInfo && !userInfo) {
      setUserInfo(cachedUserInfo);
    }
  }, []);

  // Listen for user info update events from other components
  useEffect(() => {
    const removeUpdateListener = addUserInfoUpdateListener((event) => {
      const { userInfo: newUserInfo } = event.detail;
      setUserInfo(newUserInfo);
    });

    const removeClearListener = addUserInfoClearListener(() => {
      setUserInfo(null);
    });

    return () => {
      removeUpdateListener();
      removeClearListener();
    };
  }, []);

  return {
    userInfo,
    loading,
    error,
    refreshUserInfo,
    updateUserInfo,
    clearUserInfo,
    // Helper properties
    displayName: userInfo?.username || userInfo?.email || 'Người dùng',
    email: userInfo?.email,
    profilePic: userInfo?.profilePic,
    hasProfilePic: Boolean(userInfo?.profilePic),
    initials: getInitials(userInfo?.username || userInfo?.email || 'User'),
  };
};

/**
 * Helper function to get user initials
 */
const getInitials = (name) => {
  if (!name) return 'U';
  
  const names = name.split(' ');
  if (names.length >= 2) {
    return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export default useCurrentUser;
