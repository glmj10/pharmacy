import { apiUtils } from '../utils/apiUtils';

class ErrorHandler {
  constructor(notificationService = null) {
    this.notificationService = notificationService;
    this.setupGlobalErrorHandlers();
  }

  setNotificationService(notificationService) {
    this.notificationService = notificationService;
  }

  setupGlobalErrorHandlers() {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      if (this.notificationService) {
        const errorMessage = this.getErrorMessage(event.reason);
        this.notificationService.showError(errorMessage, 'Lỗi hệ thống');
      }
      
      event.preventDefault();
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error);
      
      if (this.notificationService) {
        const errorMessage = this.getErrorMessage(event.error);
        this.notificationService.showError(errorMessage, 'Lỗi hệ thống');
      }
    });
  }

  getErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      // Try to extract meaningful error message
      if (error.message) {
        return error.message;
      }
      
      if (error.response) {
        return apiUtils.getUserFriendlyErrorMessage(error);
      }
    }
    
    return 'Đã xảy ra lỗi không xác định';
  }

  handleApiError(error, context = '') {
    console.error(`API Error ${context}:`, error);
    
    if (this.notificationService) {
      const errorMessage = apiUtils.getUserFriendlyErrorMessage(error);
      this.notificationService.showError(errorMessage);
    }
  }

  handleValidationError(error, context = '') {
    console.error(`Validation Error ${context}:`, error);
    
    if (this.notificationService) {
      const validationErrors = apiUtils.extractValidationErrors(error);
      const errorMessages = Object.values(validationErrors)
        .flat()
        .join(', ');
      
      if (errorMessages) {
        this.notificationService.showWarning(errorMessages, 'Lỗi xác thực dữ liệu');
      } else {
        this.notificationService.showError('Dữ liệu không hợp lệ');
      }
    }
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;
