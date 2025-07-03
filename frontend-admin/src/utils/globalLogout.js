import { tokenUtils } from './token';

class GlobalLogoutHandler {
  constructor() {
    this.callbacks = [];
  }

  /**
   * Đăng ký callback để handle logout
   * @param {Function} callback - Function sẽ được gọi khi logout
   */
  registerCallback(callback) {
    this.callbacks.push(callback);
    
    // Return unregister function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Trigger logout từ interceptor hoặc các nơi khác
   * @param {string} reason - Lý do logout
   */
  triggerLogout(reason = 'session_expired') {
    // Clear tokens immediately
    tokenUtils.removeTokens();
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentUserInfo');

    // Call all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(reason);
      } catch (error) {
        console.error('Error in logout callback:', error);
      }
    });

    if (this.callbacks.length === 0) {
      this.fallbackRedirect(reason);
    }
  }

  fallbackRedirect(reason) {
    const message = reason === 'session_expired' 
      ? 'Phiên đăng nhập đã hết hạn' 
      : 'Bạn đã được đăng xuất khỏi hệ thống';
    
    alert(message);
    
    window.location.href = '/admin/login';
  }

  isAuthenticated() {
    const token = tokenUtils.getAccessToken();
    return token && !tokenUtils.isTokenExpired(token);
  }
}

export const globalLogoutHandler = new GlobalLogoutHandler();
export default globalLogoutHandler;
