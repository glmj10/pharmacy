/**
 * Modal Event Utilities
 * Utilities for triggering auth modal events globally
 */

export const modalEvents = {
  /**
   * Trigger auth expired event (from API interceptor)
   * @param {string} reason - Reason for auth expiration
   * @param {string} message - Custom message to show
   */
  triggerAuthExpired: (reason = 'token_expired', message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') => {
    const event = new CustomEvent('authExpired', {
      detail: { reason, message }
    });
    window.dispatchEvent(event);
  },

  /**
   * Trigger open login modal event
   * @param {string} message - Optional message to show
   * @param {Function} callback - Optional callback after successful login
   */
  triggerOpenLoginModal: (message = null, callback = null) => {
    const event = new CustomEvent('openLoginModal', {
      detail: { message, callback }
    });
    window.dispatchEvent(event);
  },

  /**
   * Trigger open register modal event
   * @param {string} message - Optional message to show
   * @param {Function} callback - Optional callback after successful registration
   */
  triggerOpenRegisterModal: (message = null, callback = null) => {
    const event = new CustomEvent('openRegisterModal', {
      detail: { message, callback }
    });
    window.dispatchEvent(event);
  },

  /**
   * Handle required login for protected actions
   * @param {Function} actionAfterLogin - Action to execute after successful login
   * @param {string} message - Message to show to user
   */
  requireLogin: (actionAfterLogin, message = 'Bạn cần đăng nhập để thực hiện chức năng này.') => {
    modalEvents.triggerOpenLoginModal(message, actionAfterLogin);
  }
};

export default modalEvents;
