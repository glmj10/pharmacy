import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { CToaster } from '@coreui/react';
import NotificationToast from '../components/common/NotificationToast';
import errorHandler from '../utils/errorHandler';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toasterRef = useRef();

  const addToast = (toast) => {
    const newToast = { ...toast, id: Date.now() };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, title = 'Thành công') => {
    addToast({
      type: 'success',
      title,
      message,
      autohide: true,
      delay: 3000
    });
  };

  const showError = (message, title = 'Lỗi') => {
    addToast({
      type: 'error',
      title,
      message,
      autohide: true,
      delay: 5000
    });
  };

  const showWarning = (message, title = 'Cảnh báo') => {
    addToast({
      type: 'warning',
      title,
      message,
      autohide: true,
      delay: 4000
    });
  };

  const showInfo = (message, title = 'Thông tin') => {
    addToast({
      type: 'info',
      title,
      message,
      autohide: true,
      delay: 3000
    });
  };

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toasts,
    removeToast
  };

  // Setup global error handler
  useEffect(() => {
    errorHandler.setNotificationService({
      showSuccess,
      showError,
      showWarning,
      showInfo
    });
  }, []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <CToaster
        ref={toasterRef}
        placement="top-end"
        className="position-fixed"
        style={{ zIndex: 9999 }}
      >
        {toasts.map(toast => (
          <NotificationToast
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </CToaster>
    </NotificationContext.Provider>
  );
};
