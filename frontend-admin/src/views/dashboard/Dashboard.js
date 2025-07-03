import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBasket,
  cilCart,
  cilPeople,
  cilMoney,
} from '@coreui/icons'
import { useApiCall } from '../../hooks/useApiCall'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const { execute: callApi } = useApiCall()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for dashboard data
      // In a real application, you would have dashboard API endpoints
      const mockStats = {
        totalProducts: 156,
        totalOrders: 89,
        totalUsers: 234,
        totalRevenue: 15420000,
      }

      const mockRecentOrders = [
        {
          id: 1,
          customerName: 'Nguyễn Văn A',
          totalAmount: 250000,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          customerName: 'Trần Thị B',
          totalAmount: 180000,
          status: 'CONFIRMED',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          customerName: 'Lê Văn C',
          totalAmount: 320000,
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ]

      setStats(mockStats)
      setRecentOrders(mockRecentOrders)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ xử lý', color: 'warning' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'info' },
      PROCESSING: { label: 'Đang xử lý', color: 'primary' },
      SHIPPING: { label: 'Đang giao', color: 'secondary' },
      DELIVERED: { label: 'Đã giao', color: 'success' },
      CANCELLED: { label: 'Đã hủy', color: 'danger' },
    }
    const config = statusConfig[status] || { label: status, color: 'secondary' }
    return (
      <CBadge color={config.color}>
        {config.label}
      </CBadge>
    )
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <CRow>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ borderLeft: '4px solid #20a8d8' }}>
            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="text-value-lg text-primary">{stats.totalProducts}</div>
                <div>Sản phẩm</div>
              </div>
              <CIcon icon={cilBasket} size="3xl" className="text-primary" />
            </CCardBody>
          </CCard>
        </CCol>
        
        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ borderLeft: '4px solid #f86c6b' }}>
            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="text-value-lg text-danger">{stats.totalOrders}</div>
                <div>Đơn hàng</div>
              </div>
              <CIcon icon={cilCart} size="3xl" className="text-danger" />
            </CCardBody>
          </CCard>
        </CCol>
        
        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ borderLeft: '4px solid #ffc107' }}>
            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="text-value-lg text-warning">{stats.totalUsers}</div>
                <div>Người dùng</div>
              </div>
              <CIcon icon={cilPeople} size="3xl" className="text-warning" />
            </CCardBody>
          </CCard>
        </CCol>
        
        <CCol sm={6} lg={3}>
          <CCard className="mb-4" style={{ borderLeft: '4px solid #4dbd74' }}>
            <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
              <div>
                <div className="text-value-lg text-success">{formatCurrency(stats.totalRevenue)}</div>
                <div>Doanh thu</div>
              </div>
              <CIcon icon={cilMoney} size="3xl" className="text-success" />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Đơn hàng gần đây</strong>
            </CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead color="light">
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
                      <CTableDataCell>
                        <strong>#{order.id}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        {order.customerName}
                      </CTableDataCell>
                      <CTableDataCell>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        {getStatusBadge(order.status)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {formatDate(order.createdAt)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
