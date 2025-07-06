import { useCallback } from 'react';
import { toastManager } from '../utils/toastUtils';

export const useToast = () => {
  const addToast = useCallback((message, type = 'info', duration) => {
    return toastManager.addToast(message, type, duration);
  }, []);

  const removeToast = useCallback((id) => {
    toastManager.removeToast(id);
  }, []);

  const clearAllToasts = useCallback(() => {
    toastManager.clearAllToasts();
  }, []);

  const success = useCallback((message, duration) => {
    return toastManager.success(message, duration);
  }, []);

  const error = useCallback((message, duration) => {
    return toastManager.error(message, duration);
  }, []);

  const warning = useCallback((message, duration) => {
    return toastManager.warning(message, duration);
  }, []);

  const info = useCallback((message, duration) => {
    return toastManager.info(message, duration);
  }, []);

  const sessionExpired = useCallback((message) => {
    return toastManager.sessionExpired(message);
  }, []);

  return {
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    sessionExpired,
  };
};

export default useToast;
