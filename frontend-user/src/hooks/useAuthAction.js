import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';


export const useAuthAction = () => {
  const { isAuthenticated, user } = useAuth();
  const { openLoginModal } = useAuthModal();


  const executeWithAuth = (action, options = {}) => {
    return async (...args) => {
      if (!isAuthenticated || !user) {
        if (options.onRequireLogin) {
          options.onRequireLogin();
        }
        openLoginModal();
        return;
      }

      return await action(...args);
    };
  };

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
