import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './AuthModal.css';

const AuthModal = ({ onClose, initialType = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialType === 'login');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Update tab when initialType changes
  useEffect(() => {
    setIsLogin(initialType === 'login');
  }, [initialType]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(loginData);
      toast.success('Đăng nhập thành công!');
      onClose();
    } catch (error) {
      toast.error('Đăng nhập thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validate username
    if (registerData.username.length < 3) {
      toast.error('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }
    
    // Validate password
    if (registerData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    
    // Validate confirm password
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(registerData);
      toast.success('Đăng ký thành công!');
      onClose();
    } catch (error) {
      toast.error('Đăng ký thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-content">
      <div className="auth-container">
        <div className="auth-modal-header">
          <div className="auth-logo">
            <div className="logo-icon">
              <span className="logo-cross">⚕</span>
            </div>
            <span className="logo-text">Nhà Thuốc Online</span>
          </div>
          <h2 className="auth-title">
            {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
          </h2>
          <p className="auth-subtitle">
            {isLogin 
              ? ''
              : 'Tạo tài khoản để trải nghiệm dịch vụ tốt nhất'
            }
          </p>
        </div>

        <div className="auth-modal-body">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Đăng nhập
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Đăng ký
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
                placeholder="Nhập email của bạn"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button type="button" className="forgot-password">
                Quên mật khẩu?
              </button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                required
                placeholder="Nhập tên đăng nhập (ít nhất 3 ký tự)"
                minLength="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
                placeholder="Nhập email của bạn"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                required
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <div className="form-options">
              <label className="terms-agree">
                <input type="checkbox" required />
                <span>Tôi đồng ý với <a href="/terms">Điều khoản dịch vụ</a> và <a href="/privacy">Chính sách bảo mật</a></span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>Hoặc</span>
        </div>

        <div className="social-auth">
          <button type="button" className="social-btn google-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Tiếp tục với Google
          </button>
          <button type="button" className="social-btn facebook-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#1877f2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Tiếp tục với Facebook
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AuthModal;
