import React from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked } from '@coreui/icons';
import { useAuth } from './ProtectedRoute';
import { useLogout } from '../../hooks/useLogout';

/**
 * Modal xác nhận đăng xuất có thể tái sử dụng
 */
const LogoutConfirmationModal = ({ 
  visible, 
  onClose, 
  title = 'Xác nhận đăng xuất',
  message = 'Bạn có chắc chắn muốn đăng xuất?',
  subMessage = 'Phiên làm việc của bạn sẽ kết thúc và bạn cần đăng nhập lại để tiếp tục.',
  showUserInfo = true,
  confirmText = 'Đăng xuất',
  cancelText = 'Hủy',
  size = 'sm',
  variant = 'danger' // 'danger', 'warning'
}) => {
  const { user } = useAuth();
  const { logout, isLoggingOut } = useLogout();

  const handleConfirm = () => {
    logout();
    onClose();
  };

  const getIcon = () => {
    return cilLockLocked; // Sử dụng icon an toàn cho cả hai variant
  };

  const getIconColor = () => {
    return variant === 'warning' ? 'text-warning' : 'text-danger';
  };

  const getWarningSymbol = () => {
    if (variant === 'warning') {
      return (
        <span 
          className="text-warning me-3 mt-1" 
          style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
        >
          ⚠️
        </span>
      );
    }
    return (
      <CIcon 
        icon={cilLockLocked} 
        size="lg" 
        className="text-danger me-3 mt-1" 
      />
    );
  };

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      backdrop="static"
      keyboard={false}
      size={size}
    >
      <CModalHeader closeButton>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="d-flex align-items-start mb-3">
          {getWarningSymbol()}
          <div className="flex-grow-1">
            <p className="mb-1 fw-semibold">{message}</p>
            {subMessage && (
              <small className="text-muted d-block">
                {subMessage}
              </small>
            )}
          </div>
        </div>
        
        {showUserInfo && user && (
          <div className="bg-light p-3 rounded border-start border-4 border-primary">
            <div className="d-flex align-items-center">
              <CIcon icon={cilLockLocked} className="text-primary me-2" />
              <div>
                <small className="text-muted d-block">Tài khoản hiện tại:</small>
                <strong className="text-dark">
                  {user.sub || user.username || user.email || 'Người dùng'}
                </strong>
                {user.email && user.sub !== user.email && (
                  <small className="text-muted d-block">{user.email}</small>
                )}
              </div>
            </div>
          </div>
        )}
      </CModalBody>
      <CModalFooter className="border-top">
        <CButton 
          color="secondary" 
          variant="outline"
          onClick={onClose}
          disabled={isLoggingOut}
        >
          {cancelText}
        </CButton>
        <CButton 
          color={variant}
          onClick={handleConfirm}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Đang đăng xuất...
            </>
          ) : (
            <>
              <CIcon icon={cilLockLocked} className="me-2" />
              {confirmText}
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default LogoutConfirmationModal;
