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
import { authService } from '../../../services/auth'
import { apiUtils } from '../../../utils/apiUtils'

const Register = () => {
  const navigate = useNavigate()
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

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
    
    // Clear general error
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
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
        password: registerData.password
      })
      
      if (response.isSuccess()) {
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      // Handle different types of errors
      setError(apiUtils.getUserFriendlyErrorMessage(error))
      
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
                {/* Success Alert */}
                {success && (
                  <CAlert color="success">
                    {success}
                  </CAlert>
                )}
                
                {/* Error Alert */}
                {error && (
                  <CAlert color="danger" dismissible onClose={() => setError(null)}>
                    {error}
                  </CAlert>
                )}
                
                <CForm onSubmit={handleSubmit}>
                  <h1>Đăng ký</h1>
                  <p className="text-body-secondary">Tạo tài khoản mới</p>
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput 
                      placeholder="Tên người dùng" 
                      autoComplete="username"
                      name="username"
                      value={registerData.username}
                      onChange={handleInputChange}
                      invalid={!!validationErrors.username}
                      required
                    />
                  </CInputGroup>
                  {validationErrors.username && (
                    <div className="text-danger small mb-2">
                      {validationErrors.username.join(', ')}
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
                      required
                    />
                  </CInputGroup>
                  {validationErrors.email && (
                    <div className="text-danger small mb-2">
                      {validationErrors.email.join(', ')}
                    </div>
                  )}
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Mật khẩu"
                      autoComplete="new-password"
                      name="password"
                      value={registerData.password}
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
                      required
                    />
                  </CInputGroup>
                  {validationErrors.confirmPassword && (
                    <div className="text-danger small mb-2">
                      {validationErrors.confirmPassword.join(', ')}
                    </div>
                  )}
                  
                  <div className="d-grid gap-2">
                    <CButton 
                      color="success"
                      type="submit"
                      disabled={loading}
                    >
                      {loading && <CSpinner size="sm" className="me-2" />}
                      Tạo tài khoản
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
