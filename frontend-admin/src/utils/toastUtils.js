class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  /**
   * Đăng ký listener để nhận thông báo toast
   * @param {Function} callback - Function sẽ được gọi khi có toast mới
   */
  registerListener(callback) {
    this.listeners.push(callback);
    
    // Return unregister function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Thêm toast mới
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại toast (success, error, info, warning)
   * @param {number} duration - Thời gian hiển thị (ms)
   */
  addToast(message, type = 'info', duration = 5000) {
    const toast = {
      id: Date.now() + Math.random(),
      message,
      type,
      duration,
      timestamp: new Date()
    };

    this.toasts.push(toast);
    
    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(toast);
      } catch (error) {
        console.error('Error in toast listener:', error);
      }
    });

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }

    return toast.id;
  }

  /**
   * Xóa toast theo ID
   * @param {string|number} id - ID của toast
   */
  removeToast(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    
    // Notify listeners about removal
    this.listeners.forEach(callback => {
      try {
        callback(null, id);
      } catch (error) {
        console.error('Error in toast listener:', error);
      }
    });
  }

  /**
   * Xóa tất cả toasts
   */
  clearAllToasts() {
    this.toasts = [];
    this.listeners.forEach(callback => {
      try {
        callback(null, 'clear_all');
      } catch (error) {
        console.error('Error in toast listener:', error);
      }
    });
  }

  // Convenience methods
  success(message, duration = 5000) {
    return this.addToast(message, 'success', duration);
  }

  error(message, duration = 8000) {
    return this.addToast(message, 'error', duration);
  }

  warning(message, duration = 6000) {
    return this.addToast(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.addToast(message, 'info', duration);
  }

  // Special method for session expiry
  sessionExpired(message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') {
    return this.addToast(message, 'error', 10000);
  }
}

export const toastManager = new ToastManager();
export default toastManager;
