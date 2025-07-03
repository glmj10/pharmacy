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
 * Modal xác nhận đăng xuất với icons an toàn
 */
const SafeLogoutConfirmationModal = ({ 
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

  // Sử dụng Unicode emoji thay vì CoreUI icons để tránh lỗi
  const getIconElement = () => {
    if (variant === 'warning') {
      return (
        <div 
          className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle me-3"
          style={{ width: '40px', height: '40px', fontSize: '20px' }}
        >
          ⚠️
        </div>
      );
    }
    
    return (
      <div 
        className="d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle me-3"
        style={{ width: '40px', height: '40px' }}
      >
        <CIcon 
          icon={cilLockLocked} 
          className="text-danger"
          size="lg"
        />
      </div>
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
        <CModalTitle className="d-flex align-items-center">
          {variant === 'warning' ? '⚠️' : '🔒'} {title}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="d-flex align-items-start mb-3">
          {getIconElement()}
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
              <span className="me-2" style={{ fontSize: '18px' }}>👤</span>
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
              🔒 {confirmText}
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default SafeLogoutConfirmationModal;
