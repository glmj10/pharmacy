import { tokenUtils } from './token';

class GlobalLogoutHandler {
  constructor() {
    this.callbacks = [];
    this.modalCallbacks = [];
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
   * Đăng ký callback để hiển thị modal
   * @param {Function} callback - Function sẽ được gọi để hiển thị modal
   */
  registerModalCallback(callback) {
    this.modalCallbacks.push(callback);
    
    // Return unregister function
    return () => {
      this.modalCallbacks = this.modalCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Trigger logout từ interceptor hoặc các nơi khác
   * @param {string} reason - Lý do logout
   * @param {string} message - Custom message (optional)
   */
  triggerLogout(reason = 'session_expired', message = null) {
    // Show modal notification
    const logoutMessage = message || this.getLogoutMessage(reason);
    
    // Call modal callbacks to show modal
    this.modalCallbacks.forEach(callback => {
      try {
        callback(reason, logoutMessage);
      } catch (error) {
        console.error('Error in modal callback:', error);
      }
    });

    // If no modal callbacks, fall back to direct logout
    if (this.modalCallbacks.length === 0) {
      this.performLogout(reason);
    }
  }

  /**
   * Perform actual logout (called from modal or fallback)
   * @param {string} reason - Lý do logout
   */
  performLogout(reason = 'session_expired') {
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

    // Fallback if no callbacks registered
    if (this.callbacks.length === 0) {
      this.fallbackRedirect(reason);
    }
  }

  fallbackRedirect(reason) {
    // Direct redirect without toast
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 500);
  }

  getLogoutMessage(reason) {
    switch (reason) {
      case 'session_expired':
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      case 'token_refresh_failed':
        return 'Phiên đăng nhập đã bị vô hiệu hóa. Vui lòng đăng nhập lại.';
      case 'unauthorized':
        return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.';
      case 'token_invalidated':
        return 'Phiên đăng nhập đã bị vô hiệu hóa. Vui lòng đăng nhập lại.';
      default:
        return 'Bạn đã được đăng xuất khỏi hệ thống. Vui lòng đăng nhập lại.';
    }
  }

  isAuthenticated() {
    const token = tokenUtils.getAccessToken();
    return token && !tokenUtils.isTokenExpired(token);
  }
}

export const globalLogoutHandler = new GlobalLogoutHandler();
export default globalLogoutHandler;
