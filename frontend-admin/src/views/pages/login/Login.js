import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
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
import { authService } from '../../../services'
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
          if (response.data?.token || response.data?.accessToken) {
            const token = response.data.token || response.data.accessToken
            tokenUtils.setTokens(token)
          }

          if (response.data?.user) {
            localStorage.setItem('userInfo', JSON.stringify(response.data.user))
          }

          setTimeout(() => {
            navigate('/dashboard')
          }, 1000) 
        }
      }
    )
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
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
                  <div className="mb-3 text-end">
                    <Link to="/forgot-password" className="text-decoration-none text-primary small">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <div className="d-grid">
                    <CButton
                      color="primary"
                      size="lg"
                      type="submit"
                      disabled={loading || !isFormValid()}
                    >
                      {loading && (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Đang xử lý...
                        </>
                      )}
                      {!loading && 'Đăng nhập'}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default LoginImproved
