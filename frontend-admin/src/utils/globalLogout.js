import { tokenUtils } from './token';

class GlobalLogoutHandler {
  constructor() {
    this.callbacks = [];
    this.modalCallbacks = [];
  }

  registerCallback(callback) {
    this.callbacks.push(callback);
    
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  registerModalCallback(callback) {
    this.modalCallbacks.push(callback);
    
    return () => {
      this.modalCallbacks = this.modalCallbacks.filter(cb => cb !== callback);
    };
  }

  triggerLogout(reason = 'session_expired', message = null) {
    const logoutMessage = message || this.getLogoutMessage(reason);
    
    this.modalCallbacks.forEach(callback => {
      try {
        callback(reason, logoutMessage);
      } catch (error) {
        console.error('Error in modal callback:', error);
      }
    });

    if (this.modalCallbacks.length === 0) {
      this.performLogout(reason);
    }
  }

  performLogout(reason = 'session_expired') {
    tokenUtils.removeTokens();
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentUserInfo');

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
