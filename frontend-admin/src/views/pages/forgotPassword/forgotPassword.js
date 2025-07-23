import React, { useState } from 'react';
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CRow, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilEnvelopeClosed } from '@coreui/icons';
import { authService } from '../../../services';
import { useFormSubmit } from '../../../hooks/useApiCall';
import { useNavigate, Link } from 'react-router-dom';
import './forgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const { submit, loading, validationErrors, clearValidationError } = useFormSubmit();
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (validationErrors.email) clearValidationError('email');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(
      () => authService.forgotPassword({ email, isUser: false }),
      {
        successMessage: 'Đã gửi email xác nhận, vui lòng kiểm tra email để đặt lại mật khẩu!',
        onSuccess: () => setEmailSent(true)
      }
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center bg-body-tertiary">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="p-4">
              <CCardBody>
                {emailSent ? (
                  <div className="text-center">
                    <h2>Đã gửi email xác nhận</h2>
                    <p>Vui lòng kiểm tra email để đặt lại mật khẩu.</p>
                    <CButton color="primary" onClick={() => setEmailSent(false)}>Gửi lại</CButton>
                    <div className="mt-3">
                      <Link to="/login" className="text-decoration-none text-primary">
                        Quay lại đăng nhập
                      </Link>
                    </div>
                  </div>
                ) : (
                  <CForm onSubmit={handleSubmit}>
                    <h2>Quên mật khẩu</h2>
                    <p className="text-body-secondary">Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={handleChange}
                        invalid={!!validationErrors.email}
                        required
                      />
                    </CInputGroup>
                    {validationErrors.email && (
                      <div className="text-danger small mb-2">
                        {validationErrors.email.join(', ')}
                      </div>
                    )}
                    <CButton color="primary" type="submit" className="w-100 mb-2" disabled={loading || !email}>
                      {loading ? <><CSpinner size="sm" className="me-2" />Đang gửi...</> : 'Gửi hướng dẫn'}
                    </CButton>
                    <div className="text-center">
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

export default ForgotPassword;
