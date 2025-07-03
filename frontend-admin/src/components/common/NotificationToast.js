import React, { useEffect } from 'react';
import {
  CToast,
  CToastBody,
  CToastHeader,
  CToastClose
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilWarning,
  cilInfo,
  cilCheck
} from '@coreui/icons';

const NotificationToast = ({ toast, onClose }) => {
  // Auto remove toast after delay
  useEffect(() => {
    if (toast.autohide && toast.delay) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.delay);
      
      return () => clearTimeout(timer);
    }
  }, [toast.autohide, toast.delay, toast.id, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return cilCheck;
      case 'error':
        return cilWarning;
      case 'warning':
        return cilWarning;
      case 'info':
        return cilInfo;
      default:
        return cilInfo;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <CToast
      visible={true}
      color={getColor(toast.type)}
      className="text-white align-items-center"
    >
      <CToastHeader>
        <CIcon icon={getIcon(toast.type)} className="rounded me-2" />
        <strong className="me-auto">{toast.title}</strong>
        <CToastClose black="true" onClick={() => onClose(toast.id)} />
      </CToastHeader>
      <CToastBody>
        {toast.message}
      </CToastBody>
    </CToast>
  );
};

export default NotificationToast;
