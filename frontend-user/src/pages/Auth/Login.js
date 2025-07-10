import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaFacebookF,
  FaShieldAlt,
} from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-content">
          {/* Left Side - Form */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-header">
                <div className="auth-logo">
                  <div className="logo-icon">
                    <span className="logo-cross">⚕</span>
                  </div>
                  <span className="logo-text">Nhà Thuốc Online</span>
                </div>
                <h1 className="auth-title">Đăng Nhập</h1>
                <p className="auth-subtitle">
                  Chào mừng bạn trở lại! Đăng nhập để tiếp tục mua sắm.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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

                <div className="form-options">
                  <div className="remember-me">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                  </div>
                  <Link to="/forgot-password" className="forgot-password">
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="submit"
                  className={`auth-btn primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng Nhập'
                  )}
                </button>

                <div className="auth-divider">
                  <span>Hoặc đăng nhập bằng</span>
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
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="auth-link">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="auth-image-section">
            <div className="auth-image-container">
              <img
                src="/api/placeholder/600/800"
                alt="Nhà thuốc online"
                className="auth-image"
              />
              <div className="auth-image-overlay">
                <div className="auth-image-content">
                  <FaShieldAlt className="security-icon" />
                  <h2>An Toàn & Bảo Mật</h2>
                  <p>
                    Thông tin cá nhân của bạn được bảo vệ bằng công nghệ 
                    mã hóa tiên tiến nhất.
                  </p>
                  <div className="features-list">
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Thanh toán an toàn</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Bảo mật thông tin</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Hỗ trợ 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
