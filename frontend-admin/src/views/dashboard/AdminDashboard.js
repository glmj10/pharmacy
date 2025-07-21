import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CWidgetStatsA,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilBasket,
  cilCart,
  cilMoney,
  cilXCircle,
} from '@coreui/icons'
import dashboardService from '../../services/dashboard.service'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../config/constants'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load dashboard statistics
      const statsResponse = await dashboardService.getDashboardStats()
      if (statsResponse.success) {
        setStats(statsResponse.data)
      }

      // Load recent orders
      const ordersResponse = await dashboardService.getRecentOrders(5)
      console.log("Recent orders response:", ordersResponse.data); 
      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.data)
      }

      // Load top products
      const productsResponse = await dashboardService.getTopProducts(5)
      if (productsResponse.success) {
        setTopProducts(productsResponse.data)
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Lỗi khi tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status, type = 'order') => {
    const statusConfig = type === 'order' ? ORDER_STATUS_LABELS : PAYMENT_STATUS_LABELS
    const config = statusConfig[status] || { label: status, color: 'secondary' }
    return (
      <CBadge color={config.color} className="px-2 py-1">
        {config.label}
      </CBadge>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <CSpinner color="primary" />
        <div className="mt-2">Đang tải dữ liệu dashboard...</div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <CAlert color="danger" className="mb-4">
          <div className="d-flex align-items-center">
            <CIcon icon={cilXCircle} className="me-2" />
            {error}
          </div>
        </CAlert>
      )}

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Tổng quan hệ thống</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol sm={6} lg={3}>
                  <CWidgetStatsA
                    className="mb-4"
                    color="primary"
                    value={
                      <>
                        {stats.totalUsers}{' '}
                        <span className="fs-6 fw-normal">
                          <CIcon icon={cilPeople} />
                        </span>
                      </>
                    }
                    title="Tổng người dùng"
                    action={
                      <a href="#/users" className="text-white">
                        Xem chi tiết →
                      </a>
                    }
                  />
                </CCol>
                <CCol sm={6} lg={3}>
                  <CWidgetStatsA
                    className="mb-4"
                    color="info"
                    value={
                      <>
                        {stats.totalProducts}{' '}
                        <span className="fs-6 fw-normal">
                          <CIcon icon={cilBasket} />
                        </span>
                      </>
                    }
                    title="Tổng sản phẩm"
                    action={
                      <a href="#/products" className="text-white">
                        Xem chi tiết →
                      </a>
                    }
                  />
                </CCol>
                <CCol sm={6} lg={3}>
                  <CWidgetStatsA
                    className="mb-4"
                    color="warning"
                    value={
                      <>
                        {stats.totalOrders}{' '}
                        <span className="fs-6 fw-normal">
                          <CIcon icon={cilCart} />
                        </span>
                      </>
                    }
                    title="Tổng đơn hàng"
                    action={
                      <a href="#/orders" className="text-white">
                        Xem chi tiết →
                      </a>
                    }
                  />
                </CCol>
                <CCol sm={6} lg={3}>
                  <CWidgetStatsA
                    className="mb-4"
                    color="success"
                    value={
                      <>
                        {formatCurrency(stats.totalRevenue)}{' '}
                        <span className="fs-6 fw-normal">
                          <CIcon icon={cilMoney} />
                        </span>
                      </>
                    }
                    title="Tổng doanh thu"
                    action={
                      <a href="#/orders" className="text-white">
                        Xem báo cáo →
                      </a>
                    }
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={8}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Đơn hàng mới nhất</strong>
            </CCardHeader>
            <CCardBody>
              {recentOrders.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Chưa có đơn hàng nào
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Khách hàng</CTableHeaderCell>
                      <CTableHeaderCell>Tổng tiền</CTableHeaderCell>
                      <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                      <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {recentOrders.map((order) => (
                      <CTableRow key={order.id}>
                        <CTableDataCell>#{order.id}</CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>{order.customerName}</strong>
                            {order.customerPhone && (
                              <div className="small text-muted">{order.customerPhone}</div>
                            )}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <strong className="text-success">
                            {formatCurrency(order.totalAmount)}
                          </strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          {getStatusBadge(order.status, 'order')}
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(order.createdAt)}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        
        <CCol md={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Sản phẩm mới nhất</strong>
            </CCardHeader>
            <CCardBody>
              {topProducts.length === 0 ? (
                <div className="text-center text-muted py-4">
                  Chưa có sản phẩm nào
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {topProducts.map((product) => (
                    <div key={product.id} className="d-flex align-items-center">
                      <div
                        className="me-3"
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {product.thumbnailUrl ? (
                          <img
                            src={product.thumbnailUrl}
                            alt={product.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <span className="text-muted small">No img</span>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{product.title}</div>
                        <div className="text-success small">
                          {formatCurrency(product.priceNew)}
                        </div>
                        <div className="text-muted small">
                          Tồn kho: {product.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default AdminDashboard
