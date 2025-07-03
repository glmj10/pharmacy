import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute, { useAuth, withAuth } from './ProtectedRoute';

// Import your components
const Dashboard = React.lazy(() => import('../../views/dashboard/Dashboard'));
const UserList = React.lazy(() => import('../users/UserList'));
const ProductList = React.lazy(() => import('../products/productList'));

/**
 * Ví dụ về cách sử dụng Protected Route
 */
const RouteExamples = () => {
  return (
    <Routes>
      {/* Route đơn giản - chỉ cần đăng nhập */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Route yêu cầu quyền ADMIN */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <UserList />
          </ProtectedRoute>
        } 
      />

      {/* Route yêu cầu một trong nhiều quyền */}
      <Route 
        path="/products" 
        element={
          <ProtectedRoute requiredRoles={['ADMIN','STAFF']}>
            <ProductList />
          </ProtectedRoute>
        } 
      />

      {/* Route với custom fallback khi không có quyền */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute 
            requiredRoles={['ADMIN']} 
            fallback={<div>Bạn không có quyền truy cập trang này</div>}
          >
            <AdminPanel />
          </ProtectedRoute>
        } 
      />

      {/* Route với custom redirect */}
      <Route 
        path="/secure" 
        element={
          <ProtectedRoute redirectTo="/login?redirect=secure">
            <SecureContent />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

/**
 * Ví dụ sử dụng HOC withAuth
 */
const AdminPanel = withAuth(() => {
  return <div>Admin Panel</div>;
}, { requiredRoles: ['ADMIN'] });

const SecureContent = () => {
  const { user, roles, hasRole } = useAuth();
  
  return (
    <div>
      <h2>Secure Content</h2>
      <p>Welcome, {user?.sub}!</p>
      <p>Your roles: {roles?.join(', ')}</p>
      {hasRole('ADMIN') && <p>You have admin privileges</p>}
    </div>
  );
};

/**
 * Component sử dụng useAuth hook
 */
const ProfileComponent = () => {
  const { isAuthenticated, user, roles, hasRole, hasAnyRole } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login to view profile</div>;
  }

  return (
    <div>
      <h3>User Profile</h3>
      <p>Username: {user?.sub}</p>
      <p>Email: {user?.email}</p>
      <p>Roles: {roles?.join(', ')}</p>
      
      {hasRole('ADMIN') && (
        <div>
          <h4>Admin Features</h4>
          <button>Manage Users</button>
          <button>System Settings</button>
        </div>
      )}
      
      {hasAnyRole(['MANAGER', 'EMPLOYEE']) && (
        <div>
          <h4>Staff Features</h4>
          <button>View Reports</button>
          <button>Manage Products</button>
        </div>
      )}
    </div>
  );
};

export default RouteExamples;
export { ProfileComponent };
