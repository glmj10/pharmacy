import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CWidgetStatsA,
  CWidgetStatsB,
  CWidgetStatsC,
  CWidgetStatsD,
  CWidgetStatsE,
  CWidgetStatsF,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilBasket,
  cilCart,
  cilMoney,
  cilNotes,
  cilStar,
  cilTags,
  cilBuilding,
} from '@coreui/icons'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBlogs: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalContacts: 0,
  })

  useEffect(() => {
    // TODO: Fetch dashboard statistics from API
    // This would involve calling multiple APIs to get counts
    setStats({
      totalUsers: 1250,
      totalProducts: 456,
      totalOrders: 89,
      totalRevenue: 125000000,
      totalBlogs: 23,
      totalCategories: 12,
      totalBrands: 8,
      totalContacts: 15,
    })
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <>
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
                    title="Đơn hàng mới"
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
                    title="Doanh thu"
                    action={
                      <a href="#/reports" className="text-white">
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
        <CCol sm={6} lg={3}>
          <CWidgetStatsB
            className="mb-3"
            color="primary"
            inverse
            progress={{ value: 75 }}
            text="Bài viết"
            title="Blog"
            value={stats.totalBlogs}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsB
            className="mb-3"
            color="info"
            inverse
            progress={{ value: 85 }}
            text="Danh mục"
            title="Categories"
            value={stats.totalCategories}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsB
            className="mb-3"
            color="success"
            inverse
            progress={{ value: 60 }}
            text="Thương hiệu"
            title="Brands"
            value={stats.totalBrands}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsB
            className="mb-3"
            color="warning"
            inverse
            progress={{ value: 90 }}
            text="Liên hệ chờ xử lý"
            title="Contacts"
            value={stats.totalContacts}
          />
        </CCol>
      </CRow>
    </>
  )
}

export default AdminDashboard
