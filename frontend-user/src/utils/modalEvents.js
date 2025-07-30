export const modalEvents = {
  triggerAuthExpired: (reason = 'token_expired', message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') => {
    const event = new CustomEvent('authExpired', {
      detail: { reason, message }
    });
    window.dispatchEvent(event);
  },

  triggerOpenLoginModal: (message = null, callback = null) => {
    const event = new CustomEvent('openLoginModal', {
      detail: { message, callback }
    });
    window.dispatchEvent(event);
  },

  triggerOpenRegisterModal: (message = null, callback = null) => {
    const event = new CustomEvent('openRegisterModal', {
      detail: { message, callback }
    });
    window.dispatchEvent(event);
  },

  requireLogin: (actionAfterLogin, message = 'Bạn cần đăng nhập để thực hiện chức năng này.') => {
    modalEvents.triggerOpenLoginModal(message, actionAfterLogin);
  }
};

export default modalEvents;
