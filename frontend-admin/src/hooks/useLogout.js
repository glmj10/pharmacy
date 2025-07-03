import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { tokenUtils } from '../utils/token';
import { globalLogoutHandler } from '../utils/globalLogout';
import authService from '../services/auth/auth.service';
import { dispatchUserInfoCleared } from '../utils/userInfoEvents';

/**
 * Custom hook để xử lý logout
 */
export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const logout = async (options = {}) => {
    const {
      redirectTo = '/login',
      showNotification = true,
      replace = true
    } = options;

    if (isLoggingOut) return;

    setIsLoggingOut(true);
    
    try {
      // Gọi API logout để invalidate token trên server
      await authService.logout();
      
      if (showNotification) {
        showSuccess('Đăng xuất thành công!');
      }
      
    } catch (error) {
      console.error('Logout API error:', error);
      
      if (showNotification) {
        showError('Đã có lỗi xảy ra khi đăng xuất, nhưng bạn đã được đăng xuất khỏi hệ thống.');
      }
    } finally {
      // Luôn xóa token và chuyển hướng, dù API có lỗi
      tokenUtils.removeTokens();
      
      // Clear any cached user data
      localStorage.removeItem('userInfo');
      localStorage.removeItem('currentUserInfo');
      
      // Dispatch event to clear user info in all components
      dispatchUserInfoCleared();
      
      setIsLoggingOut(false);
      
      // Chuyển hướng
      navigate(redirectTo, { replace });
    }
  };

  const forceLogout = (reason = 'session_expired') => {
    tokenUtils.removeTokens();
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentUserInfo');
    
    // Dispatch event to clear user info in all components
    dispatchUserInfoCleared();
    
    const message = reason === 'session_expired' 
      ? 'Phiên đăng nhập đã hết hạn'
      : reason === 'token_refresh_failed'
      ? 'Không thể làm mới phiên đăng nhập'
      : 'Bạn đã được đăng xuất khỏi hệ thống';
      
    showError(message);
    navigate('/login', { 
      replace: true, 
      state: { reason, timestamp: Date.now() } 
    });
  };

  // Đăng ký với global logout handler
  useEffect(() => {
    const unregister = globalLogoutHandler.registerCallback(forceLogout);
    return unregister;
  }, []);

  return {
    logout,
    forceLogout,
    isLoggingOut
  };
};

export default useLogout;
