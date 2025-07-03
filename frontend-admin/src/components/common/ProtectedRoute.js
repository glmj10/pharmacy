import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenUtils } from '../../utils/token';

/**
 * Protected Route Component
 * Kiểm tra token và chuyển hướng đến login nếu không có token hợp lệ
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login',
  requiredRoles = [],
  fallback = null 
}) => {
  const location = useLocation();
  const token = tokenUtils.getAccessToken();

  // Kiểm tra token có tồn tại không
  if (!token) {
    return <Navigate 
      to={redirectTo} 
      state={{ from: location }} 
      replace 
    />;
  }

  // Kiểm tra token có hết hạn không
  if (tokenUtils.isTokenExpired(token)) {
    tokenUtils.removeTokens();
    return <Navigate 
      to={redirectTo} 
      state={{ from: location, reason: 'expired' }} 
      replace 
    />;
  }

  if (requiredRoles.length > 0) {
    const userRoles = tokenUtils.getUserAuthorities(token);
    
    if (!userRoles || !requiredRoles.some(role => userRoles.includes(role))) {
      // Không có quyền truy cập
      return fallback || <Navigate to="/403" replace />;
    }
  }

  return children;
};

export const useAuth = () => {
  const token = tokenUtils.getAccessToken();
  
  return {
    isAuthenticated: !!token && !tokenUtils.isTokenExpired(token),
    token,
    user: token ? tokenUtils.decodeToken(token) : null,
    roles: token ? tokenUtils.getUserAuthorities(token) : [],
    hasRole: (role) => {
      const roles = tokenUtils.getUserAuthorities(token);
      return roles ? roles.includes(role) : false;
    },
    hasAnyRole: (roleList) => {
      const roles = tokenUtils.getUserAuthorities(token);
      return roles ? roleList.some(role => roles.includes(role)) : false;
    }
  };
};

/**
 * Higher Order Component để bảo vệ component
 */
export const withAuth = (WrappedComponent, options = {}) => {
  return (props) => (
    <ProtectedRoute {...options}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute;