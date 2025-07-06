import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Profile = React.lazy(() => import('./views/profile/Profile'))

// Admin Views
const AdminDashboard = React.lazy(() => import('./views/admin/AdminDashboard'))
const ProductList = React.lazy(() => import('./views/admin/products/ProductList'))
const ProductForm = React.lazy(() => import('./views/admin/products/ProductForm'))
const OrderList = React.lazy(() => import('./views/admin/orders/OrderList'))
const UserList = React.lazy(() => import('./views/admin/users/UserList'))
const CategoryList = React.lazy(() => import('./views/admin/categories/CategoryList'))
const BrandList = React.lazy(() => import('./views/admin/brands/BrandList'))
const ContactList = React.lazy(() => import('./views/admin/contacts/ContactList'))
const BlogList = React.lazy(() => import('./views/admin/blogs/BlogList'))
const BlogForm = React.lazy(() => import('./views/admin/blogs/BlogForm'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/profile', name: 'Profile', element: Profile },
  
  // Admin Routes
  { path: '/', name: 'Admin', element: AdminDashboard, exact: true },
  { path: '/dashboard', name: 'Admin Dashboard', element: AdminDashboard },
  
  // Product Management
  { path: '/products', name: 'Quản lý sản phẩm', element: ProductList, exact: true },
  { path: '/products/create', name: 'Thêm sản phẩm', element: ProductForm },
  { path: '/products/edit/:id', name: 'Chỉnh sửa sản phẩm', element: ProductForm },
  
  // Order Management
  { path: '/orders', name: 'Quản lý đơn hàng', element: OrderList },
  
  // User Management
  { path: '/users', name: 'Quản lý người dùng', element: UserList },
  
  // Category Management
  { path: '/categories', name: 'Quản lý danh mục', element: CategoryList },
  
  // Brand Management
  { path: '/brands', name: 'Quản lý thương hiệu', element: BrandList },
  
  // Contact Management
  { path: '/contacts', name: 'Quản lý liên hệ', element: ContactList },
  
  // Blog Management
  { path: '/blogs', name: 'Quản lý bài viết', element: BlogList, exact: true },
  { path: '/blogs/list', name: 'Danh sách bài viết', element: BlogList },
  { path: '/blogs/create', name: 'Thêm bài viết', element: BlogForm },
  { path: '/blogs/edit/:id', name: 'Chỉnh sửa bài viết', element: BlogForm },
]

export default routes
