import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { modalEvents } from '../../utils/modalEvents';
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaGoogle,
  FaFacebookF,
  FaShieldAlt,
  FaPhone,
} from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const watchPassword = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Remove confirmPassword from data before sending
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      toast.success('Đăng ký thành công! Modal đăng nhập sẽ mở để bạn đăng nhập.');
      
      // Use modal events utility
      modalEvents.triggerOpenLoginModal('Đăng ký thành công! Vui lòng đăng nhập.');
      
      // Quay về trang chủ
      navigate('/');
    } catch (error) {
      console.error('Register error:', error);
      toast.error(
        error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-content">
          {/* Left Side - Image */}
          <div className="auth-image-section">
            <div className="auth-image-container">
              <img
                src="/api/placeholder/600/800"
                alt="Đăng ký tài khoản"
                className="auth-image"
              />
              <div className="auth-image-overlay">
                <div className="auth-image-content">
                  <FaShieldAlt className="security-icon" />
                  <h2>Tham Gia Cộng Đồng</h2>
                  <p>
                    Trở thành thành viên để nhận được nhiều ưu đãi 
                    và dịch vụ tốt nhất.
                  </p>
                  <div className="features-list">
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Ưu đãi độc quyền</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Tích điểm thưởng</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Tư vấn miễn phí</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-header">
                <div className="auth-logo">
                  <div className="logo-icon">
                    <span className="logo-cross">⚕</span>
                  </div>
                  <span className="logo-text">Nhà Thuốc Online</span>
                </div>
                <h1 className="auth-title">Đăng Ký</h1>
                <p className="auth-subtitle">
                  Tạo tài khoản mới để bắt đầu mua sắm thuốc online.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      className={`form-input ${errors.fullName ? 'error' : ''}`}
                      placeholder="Nhập họ và tên của bạn"
                      {...register('fullName', {
                        required: 'Họ và tên là bắt buộc',
                        minLength: {
                          value: 2,
                          message: 'Họ và tên phải có ít nhất 2 ký tự',
                        },
                      })}
                    />
                  </div>
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Nhập email của bạn"
                      {...register('email', {
                        required: 'Email là bắt buộc',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email không hợp lệ',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">{errors.email.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                      placeholder="Nhập số điện thoại"
                      {...register('phoneNumber', {
                        required: 'Số điện thoại là bắt buộc',
                        pattern: {
                          value: /^[0-9]{10,11}$/,
                          message: 'Số điện thoại không hợp lệ',
                        },
                      })}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <span className="error-message">{errors.phoneNumber.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Nhập mật khẩu"
                      {...register('password', {
                        required: 'Mật khẩu là bắt buộc',
                        minLength: {
                          value: 6,
                          message: 'Mật khẩu phải có ít nhất 6 ký tự',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
                        },
                      })}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">{errors.password.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Nhập lại mật khẩu"
                      {...register('confirmPassword', {
                        required: 'Vui lòng xác nhận mật khẩu',
                        validate: (value) =>
                          value === watchPassword || 'Mật khẩu không khớp',
                      })}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="terms"
                      {...register('acceptTerms', {
                        required: 'Bạn phải đồng ý với điều khoản sử dụng',
                      })}
                    />
                    <label htmlFor="terms">
                      Tôi đồng ý với{' '}
                      <Link to="/terms" className="terms-link">
                        Điều khoản sử dụng
                      </Link>{' '}
                      và{' '}
                      <Link to="/privacy" className="terms-link">
                        Chính sách bảo mật
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <span className="error-message">{errors.acceptTerms.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Đang đăng ký...
                    </>
                  ) : (
                    'Đăng Ký'
                  )}
                </button>

                <div className="auth-divider">
                  <span>Hoặc đăng ký bằng</span>
                </div>

                <div className="social-login">
                  <button type="button" className="social-btn google">
                    <FaGoogle />
                    Google
                  </button>
                  <button type="button" className="social-btn facebook">
                    <FaFacebookF />
                    Facebook
                  </button>
                </div>

                <div className="auth-footer">
                  <p>
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="auth-link">
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
