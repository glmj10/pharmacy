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
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { authService } from '../../../services'
import { apiUtils } from '../../../utils/apiUtils'
import { useNotification } from '../../../contexts/NotificationContext'

const Register = () => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Get validation status for each field
  const getValidationStatus = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      username: registerData.username.trim() !== '' && registerData.username.length >= 3,
      email: registerData.email.trim() !== '' && emailRegex.test(registerData.email),
      password: registerData.password.trim() !== '' && registerData.password.length >= 6,
      confirmPassword: registerData.confirmPassword.trim() !== '' && registerData.password === registerData.confirmPassword
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    const status = getValidationStatus()
    return status.username && status.email && status.password && status.confirmPassword
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }

    // Real-time validation for confirm password
    if (name === 'confirmPassword' && value !== registerData.password) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: ['Mật khẩu xác nhận không khớp']
      }))
    } else if (name === 'confirmPassword' && value === registerData.password) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: undefined
      }))
    }

    // Real-time validation for password when confirm password exists
    if (name === 'password' && registerData.confirmPassword && value !== registerData.confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: ['Mật khẩu xác nhận không khớp']
      }))
    } else if (name === 'password' && registerData.confirmPassword && value === registerData.confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: undefined
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setValidationErrors({})

    // Check password confirmation
    if (registerData.password !== registerData.confirmPassword) {
      setValidationErrors({ confirmPassword: ['Mật khẩu xác nhận không khớp'] })
      setLoading(false)
      return
    }

    try {
      const response = await authService.register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword
      })
      
      if (response.isSuccess()) {
        showSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        showError(response.message || 'Đăng ký thất bại')
      }
    } catch (error) {
      console.error('Register error:', error)
      
      // Handle different types of errors
      const errorMessage = apiUtils.getUserFriendlyErrorMessage(error)
      showError(errorMessage)
      
      // Extract validation errors for form fields
      const fieldErrors = apiUtils.extractValidationErrors(error)
      setValidationErrors(fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Đăng ký</h1>
                  <p className="text-body-secondary">Tạo tài khoản mới</p>
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput 
                      placeholder="Tên người dùng (tối thiểu 3 ký tự)" 
                      autoComplete="username"
                      name="username"
                      value={registerData.username}
                      onChange={handleInputChange}
                      invalid={!!validationErrors.username}
                      valid={registerData.username.length >= 3}
                      required
                    />
                  </CInputGroup>
                  {validationErrors.username && (
                    <div className="text-danger small mb-2">
                      {validationErrors.username.join(', ')}
                    </div>
                  )}
                  {registerData.username && registerData.username.length < 3 && (
                    <div className="text-warning small mb-2">
                      Tên người dùng phải có ít nhất 3 ký tự
                    </div>
                  )}
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput 
                      placeholder="Email" 
                      autoComplete="email"
                      name="email"
                      type="email"
                      value={registerData.email}
                      onChange={handleInputChange}
                      invalid={!!validationErrors.email}
                      valid={registerData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)}
                      required
                    />
                  </CInputGroup>
                  {validationErrors.email && (
                    <div className="text-danger small mb-2">
                      {validationErrors.email.join(', ')}
                    </div>
                  )}
                  {registerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email) && (
                    <div className="text-warning small mb-2">
                      Vui lòng nhập email hợp lệ
                    </div>
                  )}
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                      autoComplete="new-password"
                      name="password"
                      value={registerData.password}
                      onChange={handleInputChange}
                      invalid={!!validationErrors.password}
                      valid={registerData.password.length >= 6}
                      required
                    />
                  </CInputGroup>
                  {validationErrors.password && (
                    <div className="text-danger small mb-2">
                      {validationErrors.password.join(', ')}
                    </div>
                  )}
                  {registerData.password && registerData.password.length < 6 && (
                    <div className="text-warning small mb-2">
                      Mật khẩu phải có ít nhất 6 ký tự
                    </div>
                  )}
                  
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      autoComplete="new-password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleInputChange}
                      invalid={!!validationErrors.confirmPassword}
                      valid={registerData.confirmPassword && registerData.confirmPassword === registerData.password}
                      required
                    />
                  </CInputGroup>
                  {validationErrors.confirmPassword && (
                    <div className="text-danger small mb-2">
                      {validationErrors.confirmPassword.join(', ')}
                    </div>
                  )}
                  {registerData.confirmPassword && registerData.confirmPassword === registerData.password && registerData.password.length >= 6 && (
                    <div className="text-success small mb-2">
                      ✓ Mật khẩu khớp
                    </div>
                  )}
                  
                  {/* Form validation status */}
                  {(registerData.username || registerData.email || registerData.password || registerData.confirmPassword) && !isFormValid() && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="mt-1">
                        <div className={`small ${getValidationStatus().username ? 'text-success' : 'text-muted'}`}>
                          {getValidationStatus().username ? '✓' : '○'} Tên người dùng (tối thiểu 3 ký tự)
                        </div>
                        <div className={`small ${getValidationStatus().email ? 'text-success' : 'text-muted'}`}>
                          {getValidationStatus().email ? '✓' : '○'} Email hợp lệ
                        </div>
                        <div className={`small ${getValidationStatus().password ? 'text-success' : 'text-muted'}`}>
                          {getValidationStatus().password ? '✓' : '○'} Mật khẩu (tối thiểu 6 ký tự)
                        </div>
                        <div className={`small ${getValidationStatus().confirmPassword ? 'text-success' : 'text-muted'}`}>
                          {getValidationStatus().confirmPassword ? '✓' : '○'} Xác nhận mật khẩu khớp
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="d-grid gap-2">
                    <CButton 
                      color="success"
                      type="submit"
                      disabled={loading || !isFormValid()}
                      className={`${!isFormValid() ? 'opacity-75' : ''} ${loading ? 'position-relative' : ''}`}
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
                          {isFormValid() ? 'Tạo tài khoản' : 'Vui lòng điền đầy đủ thông tin'}
                        </>
                      )}
                    </CButton>
                    
                    <div className="text-center mt-3">
                      <span className="text-body-secondary">Đã có tài khoản? </span>
                      <Link to="/login">
                        <CButton color="link" className="p-0">
                          Đăng nhập
                        </CButton>
                      </Link>
                    </div>
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

export default Register
