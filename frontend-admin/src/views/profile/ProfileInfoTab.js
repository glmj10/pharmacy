import React, { useState, useEffect } from 'react';
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilEnvelopeOpen, cilPhone, cilLocationPin, cilSave, cilX } from '@coreui/icons';
import authService from '../../services/auth.service';
import { storage } from '../../utils/storage';
import { dispatchUserInfoUpdated } from '../../utils/userInfoEvents';

const ProfileInfoTab = ({ userInfo, loading, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    if (userInfo) {
      setFormData({
        username: userInfo.username || '',
        email: userInfo.email || ''
      });
    }
  }, [userInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', content: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage({ type: '', content: '' });
    if (userInfo) {
      setFormData({
        username: userInfo.username || '',
        email: userInfo.email || ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', content: '' });

    try {
      const info = {
        username: formData.username,
        email: formData.email
      };

      const formDataToSend = new FormData();
      formDataToSend.append('info', new Blob([JSON.stringify(info)],
       { type: 'application/json' }));

      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await authService.updateInfo(formDataToSend);

      if (response.status === 200) {
        setMessage({
          type: 'success',
          content: 'Cập nhật thông tin thành công!'
        });

        const cachedUserInfo = storage.get('currentUserInfo');
        if (cachedUserInfo) {
          const updatedUserInfo = {
            ...cachedUserInfo,
            username: formData.username,
            email: formData.email
          };
          storage.set('currentUserInfo', updatedUserInfo);
          
          dispatchUserInfoUpdated(updatedUserInfo);
        }

        if (onUpdate) {
          await onUpdate();
        }

        setIsEditing(false);
      } else {
        setMessage({
          type: 'danger',
          content: response.message || 'Có lỗi xảy ra khi cập nhật thông tin!'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'danger',
        content: error.message || 'Có lỗi xảy ra khi cập nhật thông tin!'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !userInfo) {
    return (
      <div className="text-center py-4">
        <CSpinner color="primary" />
        <div className="mt-2">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div>
      {message.content && (
        <CAlert color={message.type} dismissible onClose={() => setMessage({ type: '', content: '' })}>
          {message.content}
        </CAlert>
      )}

      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CCol md={6}>
            <div className="mb-3">
              <CFormLabel htmlFor="username">Tên đăng nhập</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-light'}
                />
              </CInputGroup>
            </div>
          </CCol>

          <CCol md={6}>
            <div className="mb-3">
              <CFormLabel htmlFor="email">Email</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilEnvelopeOpen} />
                </CInputGroupText>
                <CFormInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="bg-light"
                />
              </CInputGroup>
              <small className="text-muted">Email không thể thay đổi</small>
            </div>
          </CCol>
        </CRow>

        <div className="d-flex justify-content-end gap-2">
          {!isEditing ? (
            <CButton
              color="primary"
              onClick={handleStartEdit}
              disabled={loading}
            >
              <CIcon icon={cilUser} className="me-2" />
              Chỉnh sửa thông tin
            </CButton>
          ) : (
            <>
              <CButton
                color="secondary"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <CIcon icon={cilX} className="me-2" />
                Hủy
              </CButton>
              <CButton
                color="success"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilSave} className="me-2" />
                    Lưu thay đổi
                  </>
                )}
              </CButton>
            </>
          )}
        </div>
      </CForm>
    </div>
  );
};

export default ProfileInfoTab;
