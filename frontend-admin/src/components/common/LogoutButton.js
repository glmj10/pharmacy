import React, { useState } from 'react';
import { CButton, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked } from '@coreui/icons';
import { useLogout } from '../../hooks/useLogout';
import LogoutConfirmationModal from './LogoutConfirmationModal';

/**
 * Logout Button Component có thể tái sử dụng
 */
const LogoutButton = ({ 
  variant = 'outline', 
  color = 'danger',
  size = 'sm',
  className = '',
  showIcon = true,
  showConfirmation = true,
  children,
  ...props 
}) => {
  const [showModal, setShowModal] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  const handleLogout = () => {
    if (showConfirmation) {
      setShowModal(true);
    } else {
      logout();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <CButton
        variant={variant}
        color={color}
        size={size}
        className={className}
        onClick={handleLogout}
        disabled={isLoggingOut}
        {...props}
      >
        {isLoggingOut ? (
          <>
            <CSpinner size="sm" className="me-2" />
            Đang đăng xuất...
          </>
        ) : (
          <>
            {showIcon && <CIcon icon={cilLockLocked} className="me-2" />}
            {children || 'Đăng xuất'}
          </>
        )}
      </CButton>

      {showConfirmation && (
        <LogoutConfirmationModal
          visible={showModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default LogoutButton;
