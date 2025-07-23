import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CRow, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked } from '@coreui/icons';
import { authService } from '../../../services';
import { useFormSubmit } from '../../../hooks/useApiCall';
import './resetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const { submit, loading, validationErrors, clearValidationError } = useFormSubmit();
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) clearValidationError(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(
      () => authService.resetPassword({ password: form.password, confirmPassword: form.confirmPassword, token }),
      {
        successMessage: 'Đổi mật khẩu thành công! Hãy đăng nhập lại.',
        onSuccess: () => setSuccess(true)
      }
    );
  };

  if (!token) {
    return (
      <div className="min-vh-100 d-flex flex-row align-items-center bg-body-tertiary">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={6}>
              <CCard className="p-4">
                <CCardBody>
                  <h2>Liên kết không hợp lệ</h2>
                  <p>Vui lòng kiểm tra lại đường dẫn hoặc yêu cầu gửi lại email đặt lại mật khẩu.</p>
                  <Link to="/forgot-password" className="text-decoration-none text-primary">
                    Quay lại
                  </Link>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center bg-body-tertiary">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="p-4">
              <CCardBody>
                {success ? (
                  <div className="text-center">
                    <h2>Đổi mật khẩu thành công!</h2>
                    <Link to="/login" className="text-decoration-none text-primary">
                      Đăng nhập
                    </Link>
                  </div>
                ) : (
                  <CForm onSubmit={handleSubmit}>
                    <h2>Đặt lại mật khẩu</h2>
                    <p className="text-body-secondary">Nhập mật khẩu mới cho tài khoản của bạn</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        minLength={6}
                        invalid={!!validationErrors.password}
                        required
                      />
                    </CInputGroup>
                    {validationErrors.password && (
                      <div className="text-danger small mb-2">
                        {validationErrors.password.join(', ')}
                      </div>
                    )}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        invalid={!!validationErrors.confirmPassword}
                        required
                      />
                    </CInputGroup>
                    {validationErrors.confirmPassword && (
                      <div className="text-danger small mb-2">
                        {validationErrors.confirmPassword.join(', ')}
                      </div>
                    )}
                    <CButton color="primary" type="submit" className="w-100" disabled={loading || !form.password || !form.confirmPassword}>
                      {loading ? <><CSpinner size="sm" className="me-2" />Đang đổi mật khẩu...</> : 'Đổi mật khẩu'}
                    </CButton>
                    <div className="text-center mt-3">
                      <Link to="/login" className="text-decoration-none text-primary">
                        Quay lại đăng nhập
                      </Link>
                    </div>
                  </CForm>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default ResetPassword;
