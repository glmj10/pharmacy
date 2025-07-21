import { tokenUtils } from '../../utils/token';

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


export const withAuth = (WrappedComponent, options = {}) => {
  return (props) => (
    <ProtectedRoute {...options}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
};