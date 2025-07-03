import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { authService } from '../../../services/auth'
import { tokenUtils } from '../../../utils/token'
import { useFormSubmit } from '../../../hooks/useApiCall'

const LoginImproved = () => {
  const navigate = useNavigate()
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const { submit, loading, validationErrors, clearValidationError } = useFormSubmit()

  // Check if form is valid
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return (
      loginData.email.trim() !== '' &&
      emailRegex.test(loginData.email) &&
      loginData.password.trim() !== ''
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear validation error for this field
    if (validationErrors[name]) {
      clearValidationError(name)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await submit(
      () => authService.login(loginData),
      {
        successMessage: 'Đăng nhập thành công!',
        onSuccess: (response) => {
          // Save token if provided
          if (response.data?.token || response.data?.accessToken) {
            const token = response.data.token || response.data.accessToken
            tokenUtils.setTokens(token)
          }

          // Save user info if provided
          if (response.data?.user) {
            localStorage.setItem('userInfo', JSON.stringify(response.data.user))
          }

          setTimeout(() => {
            navigate('/dashboard')
          }, 1000) // Delay 1 second to show success message
        }
      }
    )
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Đăng nhập</h1>
                    <p className="text-body-secondary">Đăng nhập vào tài khoản của bạn</p>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Email"
                        autoComplete="email"
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={handleInputChange}
                        invalid={!!validationErrors.email}
                        valid={loginData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)}
                        required
                      />
                    </CInputGroup>
                    {validationErrors.email && (
                      <div className="text-danger small mb-2">
                        {validationErrors.email.join(', ')}
                      </div>
                    )}
                    {loginData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email) && (
                      <div className="text-warning small mb-2">
                        Vui lòng nhập email hợp lệ
                      </div>
                    )}

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Mật khẩu"
                        autoComplete="current-password"
                        name="password"
                        value={loginData.password}
                        onChange={handleInputChange}
                        invalid={!!validationErrors.password}
                        required
                      />
                    </CInputGroup>
                    {validationErrors.password && (
                      <div className="text-danger small mb-2">
                        {validationErrors.password.join(', ')}
                      </div>
                    )}

                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          className="px-4"
                          type="submit"
                          disabled={loading || !isFormValid()}
                          style={{ minHeight: '44px' }}
                        >
                          {loading && (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Đang xử lý...
                            </>
                          )}
                          {!loading && (
                            <>
                              {isFormValid() ? 'Đăng nhập' : 'Đăng nhập'}
                            </>
                          )}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Đăng ký tài khoản</h2>
                    <p>
                      Đăng ký tài khoản để trải nghiệm các tính năng mới nhất của chúng tôi.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Đăng ký ngay!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default LoginImproved
