import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilBasket,
  cilCart,
  cilPeople,
  cilDescription,
  cilFolder,
  cilBuilding,
  cilEnvelopeClosed,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'ADMIN',
    },
  },
  {
    component: CNavTitle,
    name: 'Quản lý chính',
  },
  {
    component: CNavGroup,
    name: 'Sản phẩm',
    to: '/products',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh sách sản phẩm',
        to: '/products',
      },
      {
        component: CNavItem,
        name: 'Thêm sản phẩm',
        to: '/products/create',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Đơn hàng',
    to: '/orders',
    icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Người dùng',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Cấu hình',
  },
  {
    component: CNavItem,
    name: 'Danh mục',
    to: '/categories',
    icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Thương hiệu',
    to: '/brands',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Hỗ trợ',
  },
  {
    component: CNavGroup,
    name: 'Nội dung',
    to: '/blogs',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh sách bài viết',
        to: '/blogs',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Liên hệ',
    to: '/contacts',
    icon: <CIcon icon={cilEnvelopeClosed} customClassName="nav-icon" />,
  },
]

export default _nav
