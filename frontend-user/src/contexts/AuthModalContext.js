import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import AuthModal from '../components/AuthModal/AuthModal';

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState('login'); // 'login' or 'register'
  const callbackRef = useRef(null);

  // Listen for global events to open modal
  useEffect(() => {
    const handleAuthExpired = (event) => {
      const { reason, message } = event.detail;
      toast.error(message || 'Phiên đăng nhập đã hết hạn');
      openLoginModal();
    };

    const handleOpenLoginModal = (event) => {
      const { message, callback } = event.detail || {};
      if (message) {
        toast.info(message);
      }
      openLoginModal(callback);
    };

    const handleOpenRegisterModal = (event) => {
      const { message, callback } = event.detail || {};
      if (message) {
        toast.info(message);
      }
      openRegisterModal(callback);
    };

    // Add event listeners
    window.addEventListener('authExpired', handleAuthExpired);
    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('openRegisterModal', handleOpenRegisterModal);

    // Cleanup
    return () => {
      window.removeEventListener('authExpired', handleAuthExpired);
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('openRegisterModal', handleOpenRegisterModal);
    };
  }, []);

  const openLoginModal = (callback = null) => {
    setModalType('login');
    setIsOpen(true);
    callbackRef.current = callback;
  };

  const openRegisterModal = (callback = null) => {
    setModalType('register');
    setIsOpen(true);
    callbackRef.current = callback;
  };

  const closeModal = () => {
    setIsOpen(false);
    callbackRef.current = null;
  };

  const handleAuthSuccess = () => {
    try {
      if (callbackRef.current && typeof callbackRef.current === 'function') {
        callbackRef.current();
      }
    } catch (error) {
      console.error('Error executing success callback:', error);
    } finally {
      closeModal();
    }
  };

  const value = {
    isOpen,
    modalType,
    openLoginModal,
    openRegisterModal,
    closeModal,
    handleAuthSuccess,
    setModalType, // Add this for the AuthModal component
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {/* Render AuthModal globally */}
      {isOpen && <AuthModal />}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
