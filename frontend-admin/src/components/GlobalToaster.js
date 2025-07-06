import React, { useState, useEffect } from 'react';
import {
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CToastClose,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilCheckCircle,
  cilXCircle,
  cilWarning,
  cilInfo,
} from '@coreui/icons';
import { toastManager } from '../utils/toastUtils';

const GlobalToaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Register listener for toast events
    const unregister = toastManager.registerListener((toast, removeId) => {
      if (removeId === 'clear_all') {
        setToasts([]);
      } else if (removeId) {
        // Remove specific toast
        setToasts(prev => prev.filter(t => t.id !== removeId));
      } else if (toast) {
        // Add new toast
        setToasts(prev => [...prev, toast]);
      }
    });

    return unregister;
  }, []);

  const removeToast = (id) => {
    toastManager.removeToast(id);
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return cilCheckCircle;
      case 'error':
        return cilXCircle;
      case 'warning':
        return cilWarning;
      case 'info':
      default:
        return cilInfo;
    }
  };

  const getToastColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getToastTitle = (type) => {
    switch (type) {
      case 'success':
        return 'Thành công';
      case 'error':
        return 'Lỗi';
      case 'warning':
        return 'Cảnh báo';
      case 'info':
      default:
        return 'Thông tin';
    }
  };

  return (
    <CToaster className="p-3" placement="top-end">
      {toasts.map((toast) => (
        <CToast
          key={toast.id}
          visible={true}
          color={getToastColor(toast.type)}
          className="text-white align-items-center"
        >
          <div className="d-flex">
            <CToastBody className="mx-auto">
              <div className="d-flex align-items-center">
                <CIcon 
                  icon={getToastIcon(toast.type)} 
                  className="me-2" 
                  size="lg" 
                />
                <div>
                  <div className="fw-semibold">
                    {getToastTitle(toast.type)}
                  </div>
                  <div className="small">
                    {toast.message}
                  </div>
                </div>
              </div>
            </CToastBody>
            <CToastClose
              className="me-2 m-auto"
              white
              onClick={() => removeToast(toast.id)}
            />
          </div>
        </CToast>
      ))}
    </CToaster>
  );
};

export default GlobalToaster;
