import React, { useState, useRef } from 'react';
import {
  CButton,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CProgress,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCamera, cilCloudUpload, cilSave, cilX } from '@coreui/icons';
import UserAvatar from '../../components/common/UserAvatar';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';
import { storage } from '../../utils/storage';
import { dispatchUserInfoUpdated } from '../../utils/userInfoEvents';

const AvatarUploadTab = ({ userInfo, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'danger',
        content: 'Chỉ hỗ trợ file ảnh định dạng JPG, PNG, GIF!'
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      setMessage({
        type: 'danger',
        content: 'Kích thước file không được vượt quá 5MB!'
      });
      return;
    }

    setSelectedFile(file);
    setMessage({ type: '', content: '' });

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({
        type: 'danger',
        content: 'Vui lòng chọn file ảnh!'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage({ type: '', content: '' });

    try {
      const formData = new FormData();
      formData.append('profilePic', selectedFile);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await authService.updateInfo(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.status === 200) {
        setTimeout(() => {
          setMessage({
            type: 'success',
            content: 'Cập nhật ảnh đại diện thành công!'
          });
          
          setPreviewImage(null);
          setSelectedFile(null);
          setUploadProgress(0);
          
          const cachedUserInfo = storage.get('currentUserInfo');
          if (cachedUserInfo && response.data) {
            const updatedUserInfo = {
              ...cachedUserInfo,
              profilePic: response.data.profilePic
            };
            storage.set('currentUserInfo', updatedUserInfo);
            
            dispatchUserInfoUpdated(updatedUserInfo);
          }
          
          if (onUpdate) {
            onUpdate();
          }
        }, 500);
      } else {
        setMessage({
          type: 'danger',
          content: response.message || 'Có lỗi xảy ra khi tải ảnh lên!'
        });
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({
        type: 'danger',
        content: error.message || 'Có lỗi xảy ra khi tải ảnh lên!'
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setUploadProgress(0);
    setMessage({ type: '', content: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {/* Thông báo */}
      {message.content && (
        <CAlert color={message.type} dismissible onClose={() => setMessage({ type: '', content: '' })}>
          {message.content}
        </CAlert>
      )}

      <div className="mb-4">
        <h5>Ảnh đại diện</h5>
        <p className="text-muted">
          Tải lên ảnh đại diện của bạn. Ảnh sẽ được hiển thị dưới dạng hình tròn.
        </p>
      </div>

      <CRow>
        {/* Avatar hiện tại */}
        <CCol md={6}>
          <CCard>
            <CCardBody className="text-center">
              <h6 className="mb-3">Ảnh hiện tại</h6>
              <div className="mb-3 d-flex justify-content-center align-items-center" style={{ minHeight: '120px' }}>
                <UserAvatar
                  userInfo={userInfo}
                  size="xxl"
                  className="border border-3 border-light shadow-sm"
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Upload ảnh mới */}
        <CCol md={6}>
          <CCard>
            <CCardBody className="text-center">
              <h6 className="mb-3">Ảnh mới</h6>
              
              {/* Preview ảnh mới */}
              <div className="mb-3 d-flex justify-content-center align-items-center" style={{ minHeight: '120px' }}>
                {previewImage ? (
                  <div className="position-relative d-inline-block">
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #f8f9fa',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      border: '2px dashed #ccc',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <CIcon icon={cilCamera} size="xl" className="text-muted" />
                  </div>
                )}
              </div>

              {/* Upload progress */}
              {uploadProgress > 0 && (
                <div className="mb-3">
                  <CProgress value={uploadProgress} />
                  <small className="text-muted">{uploadProgress}%</small>
                </div>
              )}

              {/* File input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* Buttons */}
              <div className="d-grid gap-2">
                {!selectedFile ? (
                  <CButton
                    color="primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <CIcon icon={cilCloudUpload} className="me-2" />
                    Chọn ảnh
                  </CButton>
                ) : (
                  <>
                    <CButton
                      color="success"
                      onClick={handleUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Đang tải lên...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilSave} className="me-2" />
                          Tải lên
                        </>
                      )}
                    </CButton>
                    <CButton
                      color="secondary"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isUploading}
                    >
                      <CIcon icon={cilX} className="me-2" />
                      Hủy
                    </CButton>
                  </>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Hướng dẫn */}
      <hr className="my-4" />
      <div className="alert alert-info">
        <h6 className="alert-heading">📝 Lưu ý khi tải ảnh:</h6>
        <ul className="mb-0">
          <li>Định dạng hỗ trợ: JPG, PNG, GIF</li>
          <li>Kích thước tối đa: 5MB</li>
          <li>Ảnh sẽ được tự động cắt thành hình tròn</li>
          <li>Khuyến nghị: Sử dụng ảnh vuông để có kết quả tốt nhất</li>
          <li>Ảnh sẽ được nén tự động để tối ưu tốc độ tải</li>
        </ul>
      </div>
    </div>
  );
};

export default AvatarUploadTab;
