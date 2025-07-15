import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';

/**
 * Hook để xử lý các hành động yêu cầu đăng nhập
 * Nếu người dùng đã đăng nhập, thực hiện hành động
 * Nếu chưa đăng nhập, hiển thị modal đăng nhập
 */
export const useAuthAction = () => {
  const { isAuthenticated, user } = useAuth();
  const { openLoginModal } = useAuthModal();

  /**
   * Thực hiện một hành động yêu cầu đăng nhập
   * @param {Function} action - Hành động cần thực hiện khi đã đăng nhập
   * @param {Object} options - Tùy chọn
   * @param {Function} options.onRequireLogin - Callback khi cần đăng nhập (tùy chọn)
   * @returns {Function} - Function để thực hiện hành động
   */
  const executeWithAuth = (action, options = {}) => {
    return async (...args) => {
      if (!isAuthenticated || !user) {
        // Nếu chưa đăng nhập, hiển thị modal
        if (options.onRequireLogin) {
          options.onRequireLogin();
        }
        openLoginModal();
        return;
      }

      // Nếu đã đăng nhập, thực hiện hành động
      return await action(...args);
    };
  };

  /**
   * Kiểm tra xem có cần hiển thị modal đăng nhập không
   * @returns {boolean}
   */
  const requiresLogin = () => {
    return !isAuthenticated || !user;
  };

  return {
    executeWithAuth,
    requiresLogin,
    isAuthenticated,
    user
  };
};
