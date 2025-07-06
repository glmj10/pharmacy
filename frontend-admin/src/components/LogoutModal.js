import React from 'react';
import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilWarning,
  cilInfo,
  cilXCircle,
} from '@coreui/icons';

const LogoutModal = ({ visible, onClose, onConfirm, reason, message }) => {
  const getModalConfig = (reason) => {
    switch (reason) {
      case 'session_expired':
        return {
          title: 'Phiên đăng nhập đã hết hạn',
          icon: cilWarning,
          color: 'warning',
          defaultMessage: 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.',
        };
      case 'token_refresh_failed':
        return {
          title: 'Không thể làm mới phiên đăng nhập',
          icon: cilXCircle,
          color: 'danger',
          defaultMessage: 'Hệ thống không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.',
        };
      case 'unauthorized':
        return {
          title: 'Không có quyền truy cập',
          icon: cilXCircle,
          color: 'danger',
          defaultMessage: 'Bạn không có quyền truy cập vào tài nguyên này. Vui lòng đăng nhập lại.',
        };
      case 'token_invalidated':
        return {
          title: 'Token đã bị vô hiệu hóa',
          icon: cilXCircle,
          color: 'danger',
          defaultMessage: 'Token đăng nhập đã bị vô hiệu hóa. Vui lòng đăng nhập lại.',
        };
      default:
        return {
          title: 'Cần đăng nhập lại',
          icon: cilInfo,
          color: 'info',
          defaultMessage: 'Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.',
        };
    }
  };

  const config = getModalConfig(reason);
  const displayMessage = message || config.defaultMessage;

  return (
    <CModal
      visible={visible}
      onClose={() => {}} // Disable closing
      alignment="center"
      backdrop="static"
      keyboard={false}
    >
      <CModalHeader closeButton={false}>
        <CModalTitle>
          <CIcon icon={config.icon} className="me-2" />
          {config.title}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CAlert color={config.color} className="d-flex align-items-center">
          <CIcon icon={config.icon} className="me-2" size="lg" />
          <div>
            {displayMessage}
          </div>
        </CAlert>
        <p className="text-muted mb-0">
          <small>
            Bạn sẽ được chuyển hướng đến trang đăng nhập để tiếp tục sử dụng hệ thống.
          </small>
        </p>
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={onConfirm}>
          Đăng nhập lại
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default LogoutModal;
