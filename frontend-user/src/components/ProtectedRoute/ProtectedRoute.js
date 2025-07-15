import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const location = useLocation();

  useEffect(() => {
    // Nếu không authenticated và không đang loading, mở modal
    if (!loading && !isAuthenticated) {
      openLoginModal(() => {
        // Callback để redirect sau khi login thành công
        // Navigate sẽ được handle bởi login success logic
      });
    }
  }, [isAuthenticated, loading, openLoginModal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Chuyển hướng về trang chủ, modal sẽ tự động mở
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
