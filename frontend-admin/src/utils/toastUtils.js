class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  registerListener(callback) {
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  addToast(message, type = 'info', duration = 5000) {
    const toast = {
      id: Date.now() + Math.random(),
      message,
      type,
      duration,
      timestamp: new Date()
    };

    this.toasts.push(toast);
    
    this.listeners.forEach(callback => {
      try {
        callback(toast);
      } catch (error) {
        console.error('Error in toast listener:', error);
      }
    });

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }

    return toast.id;
  }

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

  sessionExpired(message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') {
    return this.addToast(message, 'error', 10000);
  }
}

export const toastManager = new ToastManager();
export default toastManager;
