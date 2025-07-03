import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CSpinner,
  CAlert,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked, cilCamera, cilSave, cilX, cilPencil } from '@coreui/icons';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import UserAvatar from '../../components/common/UserAvatar';
import ProfileInfoTab from './ProfileInfoTab';
import ChangePasswordTab from './ChangePasswordTab';
import AvatarUploadTab from './AvatarUploadTab';

/**
 * Profile View - Trang hồ sơ người dùng
 * Cho phép xem và chỉnh sửa thông tin cá nhân
 */
const Profile = () => {
  const [activeKey, setActiveKey] = useState(1);
  const { userInfo, loading, displayName, email, refresh } = useCurrentUser();

  if (loading && !userInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <CCard className="mb-4">
        <CCardBody>
          <CRow className="align-items-center">
            <CCol xs="auto">
              <UserAvatar 
                userInfo={userInfo} 
                loading={loading} 
                size="xl"
                className="border border-3 border-light shadow-sm"
              />
            </CCol>
            <CCol>
              <h4 className="mb-1">{displayName}</h4>
              <p className="text-muted mb-2">{email}</p>
            </CCol>
            <CCol xs="auto">
              <CButton 
                color="primary" 
                variant="outline"
                onClick={() => refresh()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilUser} className="me-2" />
                    Làm mới
                  </>
                )}
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Tabs cho các phần khác nhau */}
      <CCard>
        <CCardHeader>
          <CNav variant="tabs" role="tablist">
            <CNavItem>
              <CNavLink
                active={activeKey === 1}
                onClick={() => setActiveKey(1)}
                style={{ cursor: 'pointer' }}
              >
                <CIcon icon={cilUser} className="me-2" />
                Thông tin cá nhân
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeKey === 2}
                onClick={() => setActiveKey(2)}
                style={{ cursor: 'pointer' }}
              >
                <CIcon icon={cilLockLocked} className="me-2" />
                Đổi mật khẩu
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeKey === 3}
                onClick={() => setActiveKey(3)}
                style={{ cursor: 'pointer' }}
              >
                <CIcon icon={cilCamera} className="me-2" />
                Ảnh đại diện
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>
        <CCardBody>
          <CTabContent>
            <CTabPane role="tabpanel" aria-labelledby="profile-info-tab" visible={activeKey === 1}>
              <ProfileInfoTab userInfo={userInfo} loading={loading} onUpdate={refresh} />
            </CTabPane>
            <CTabPane role="tabpanel" aria-labelledby="change-password-tab" visible={activeKey === 2}>
              <ChangePasswordTab userInfo={userInfo} />
            </CTabPane>
            <CTabPane role="tabpanel" aria-labelledby="avatar-upload-tab" visible={activeKey === 3}>
              <AvatarUploadTab userInfo={userInfo} onUpdate={refresh} />
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default Profile;
