import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import './AuthModal.css';

const AuthModal = () => {
  const { isOpen, modalType, closeModal, handleAuthSuccess, setModalType, openModal } = useAuthModal();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login, register, forgotPassword, resetPassword } = useAuth();

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

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetData, setResetData] = useState({ password: '', confirmPassword: '', token: '' });
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasResetPassword = params.has('resetPassword');
    const token = params.get('token');
    if (token) {
      setResetPasswordMode(true);
      setForgotPasswordMode(false);
      setModalType && setModalType('login');
      setResetData((prev) => ({ ...prev, token }));
      openModal && openModal();
    } else if (hasResetPassword) {
      setResetPasswordMode(true);
      setForgotPasswordMode(false);
      setModalType && setModalType('login');
      openModal && openModal();
    }
  }, [location.search, openModal]);

  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: '', password: '' });
      setRegisterData({ email: '', username: '', password: '', confirmPassword: '' });
      setForgotEmail("");
      setLoading(false);
      setForgotPasswordMode(false);
      setResetPasswordMode(false);
      setResetData({ oldPassword: '', password: '', confirmPassword: '' });
    }
  }, [isOpen]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(loginData);
      toast.success('Đăng nhập thành công!');
      handleAuthSuccess();
    } catch (error) {
      toast.error('Đăng nhập thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (registerData.username.length < 3) {
      toast.error('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }
    
    if (registerData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Registering with data:', registerData);
      await register(registerData);
      toast.success('Đăng ký thành công!');
      handleAuthSuccess();
    } catch (error) {
      toast.error('Đăng ký thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Email không được để trống!');
      return;
    }
    setForgotLoading(true);
    try {
      await forgotPassword({ email: forgotEmail, isUser: true });
      setEmailSentNotice(true);
      setForgotPasswordMode(false);
      setForgotEmail("");
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Lỗi không xác định";
      toast.error("Không thể gửi email: " + msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetData.password || resetData.password.length < 6) {
      toast.error('Mật khẩu mới phải có độ dài từ 6 ký tự!');
      return;
    }
    if (!resetData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không được để trống!');
      return;
    }
    if (resetData.password !== resetData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetData);
      toast.success('Đổi mật khẩu thành công!');
      setResetPasswordMode(false);
      setResetData({ password: '', confirmPassword: '', token: '' });
    } catch (error) {
      toast.error('Đổi mật khẩu thất bại: ' + (error.response.data.message || 'Lỗi không xác định'));
    } finally {
      setResetLoading(false);
    }
  };

  const removeTokenParam = () => {
    const params = new URLSearchParams(location.search);
    if (params.has('token')) {
      params.delete('token');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      removeTokenParam();
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        {emailSentNotice ? (
          <div className="auth-modal-body">
            <h2 className="auth-title">Đã gửi email xác nhận</h2>
            <p className="auth-subtitle">Vui lòng kiểm tra email để xác thực tài khoản hoặc đặt lại mật khẩu.</p>
            <button className="auth-submit-btn" onClick={() => setEmailSentNotice(false)}>Đóng</button>
          </div>
        ) : (
          <>
            <div className="auth-modal-header">
              <div className="auth-logo">
                <div className="logo-icon">
                  <span className="logo-cross">⚕</span>
                </div>
                <span className="logo-text">Nhà Thuốc Online</span>
              </div>
              <button className="close-btn" onClick={() => {
                if (resetPasswordMode) removeTokenParam();
                closeModal();
              }}>
                ×
              </button>
              <h2 className="auth-title">
                {resetPasswordMode
                  ? 'Đổi mật khẩu'
                  : forgotPasswordMode
                    ? 'Quên mật khẩu'
                    : modalType === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
              </h2>
              <p className="auth-subtitle">
                {resetPasswordMode
                  ? 'Vui lòng nhập đầy đủ thông tin để đổi mật khẩu.'
                  : forgotPasswordMode
                    ? 'Nhập email để nhận hướng dẫn đặt lại mật khẩu.'
                    : modalType === 'login' 
                      ? 'Chào mừng bạn quay trở lại!' 
                      : 'Tạo tài khoản để trải nghiệm dịch vụ tốt nhất'}
              </p>
            </div>
            <div className="auth-modal-body">
              {resetPasswordMode ? (
                <form onSubmit={handleResetPassword} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="password">Mật khẩu mới</label>
                    <input
                      type="password"
                      id="password"
                      value={resetData.password}
                      onChange={e => setResetData({ ...resetData, password: e.target.value })}
                      required
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      minLength="6"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={resetData.confirmPassword}
                      onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })}
                      required
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                  <div className="form-options" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className="back-to-login" onClick={() => {
                      setResetPasswordMode(false);
                      removeTokenParam();
                    }}>
                      Quay lại đăng nhập
                    </button>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={resetLoading}>
                    {resetLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              ) : forgotPasswordMode ? (
                <form onSubmit={handleForgotPassword} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="forgot-email">Email</label>
                    <input
                      type="email"
                      id="forgot-email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                  <div className="form-options" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className="back-to-login" onClick={() => setForgotPasswordMode(false)}>
                      Quay lại đăng nhập
                    </button>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={forgotLoading}>
                    {forgotLoading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
                  </button>
                </form>
              ) : (
                <>
                  <div className="auth-tabs">
                    <button 
                      className={`auth-tab ${modalType === 'login' ? 'active' : ''}`}
                      onClick={() => setModalType('login')}
                    >
                      Đăng nhập
                    </button>
                    <button 
                      className={`auth-tab ${modalType === 'register' ? 'active' : ''}`}
                      onClick={() => setModalType('register')}
                    >
                      Đăng ký
                    </button>
                  </div>
                  {modalType === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="auth-form">
                      <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                          type="email"
                          id="login-email"
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
                        <button type="button" className="forgot-password" onClick={() => setForgotPasswordMode(true)}>
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
                        <label htmlFor="register-email">Email</label>
                        <input
                          type="email"
                          id="register-email"
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
