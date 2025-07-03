import React, { useState, useEffect } from 'react'
import {
  CButton,
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
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CPagination,
  CPaginationItem,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilOptions,
  cilInfo,
  cilCheckCircle,
  cilXCircle,
  cilClock,
  cilMoney,
  cilCart,
} from '@coreui/icons'
import { useOrders } from '../../../hooks/useOrders'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS, PAYMENT_STATUS } from '../../../config/constants'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'

const OrderList = () => {
  const {
    orders,
    loading,
    error,
    pagination,
    getOrders,
    getOrderDetails,
    updateOrderStatus,
    updatePaymentStatus,
    clearError,
    isEmpty,
  } = useOrders()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusModal, setStatusModal] = useState({ 
    visible: false, 
    order: null, 
    type: '', // 'status' or 'payment'
    newStatus: '' 
  })
  const [detailModal, setDetailModal] = useState({ 
    visible: false, 
    order: null, 
    details: null 
  })

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async (page = 1, search = '') => {
    try {
      await getOrders({
        page,
        search: search.trim() || undefined,
        size: 10
      })
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadOrders(1, searchTerm)
  }

  const handlePageChange = (page) => {
    loadOrders(page, searchTerm)
  }

  const handleStatusUpdate = async () => {
    if (!statusModal.order || !statusModal.newStatus) return

    try {
      if (statusModal.type === 'status') {
        await updateOrderStatus(statusModal.order.id, statusModal.newStatus)
      } else {
        await updatePaymentStatus(statusModal.order.id, statusModal.newStatus)
      }
      
      setStatusModal({ visible: false, order: null, type: '', newStatus: '' })
      // Orders are updated automatically in the hook
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleViewDetails = async (order) => {
    try {
      const details = await getOrderDetails(order.id)
      setDetailModal({ 
        visible: true, 
        order,
        details 
      })
    } catch (error) {
      console.error('Error fetching order details:', error)
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

  const getStatusBadge = (status, type = 'order') => {
    const statusConfig = type === 'order' ? ORDER_STATUS_LABELS : PAYMENT_STATUS_LABELS
    const config = statusConfig[status] || { label: status, color: 'secondary' }
    return (
      <CBadge color={config.color}>
        {config.label}
      </CBadge>
    )
  }

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    const items = []
    const currentPage = pagination.currentPage
    const totalPages = pagination.totalPages

    // Previous button
    items.push(
      <CPaginationItem
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Previous
      </CPaginationItem>
    )

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        items.push(
          <CPaginationItem
            key={i}
            active={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </CPaginationItem>
        )
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        items.push(<CPaginationItem key={i} disabled>...</CPaginationItem>)
      }
    }

    // Next button
    items.push(
      <CPaginationItem
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </CPaginationItem>
    )

    return <CPagination>{items}</CPagination>
  }

  if (loading && orders.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Quản lý đơn hàng</strong>
            </CCardHeader>
            <CCardBody>
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-3">
                <CRow>
                  <CCol md={6}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Tìm kiếm theo ID đơn hàng, tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <CInputGroupText>
                        <CIcon icon={cilSearch} />
                      </CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol md={2}>
                    <CButton type="submit" color="primary" disabled={loading}>
                      Tìm kiếm
                    </CButton>
                  </CCol>
                </CRow>
              </form>

              {/* Error Alert */}
              {error && (
                <CAlert color="danger" dismissible onClose={clearError}>
                  {error}
                </CAlert>
              )}

              {/* Orders Table */}
              {isEmpty ? (
                <EmptyState 
                  title="Không có đơn hàng"
                  description="Chưa có đơn hàng nào trong hệ thống."
                  icon={cilCart}
                />
              ) : (
                <>
                  <CTable align="middle" className="mb-0 border" hover responsive>
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>ID</CTableHeaderCell>
                        <CTableHeaderCell>Khách hàng</CTableHeaderCell>
                        <CTableHeaderCell>Tổng tiền</CTableHeaderCell>
                        <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                        <CTableHeaderCell>Thanh toán</CTableHeaderCell>
                        <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                        <CTableHeaderCell>Thao tác</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {orders.map((order) => (
                        <CTableRow key={order.id}>
                          <CTableDataCell>
                            <strong>#{order.id}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <strong>{order.customerName}</strong>
                              <br />
                              <small className="text-muted">{order.customerPhone}</small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <strong>{formatCurrency(order.totalAmount)}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            {getStatusBadge(order.status, 'order')}
                          </CTableDataCell>
                          <CTableDataCell>
                            {getStatusBadge(order.paymentStatus, 'payment')}
                          </CTableDataCell>
                          <CTableDataCell>
                            {formatDate(order.createdAt)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CDropdown>
                              <CDropdownToggle size="sm" color="ghost">
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem onClick={() => handleViewDetails(order)}>
                                  <CIcon icon={cilInfo} className="me-2" />
                                  Chi tiết
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => setStatusModal({
                                    visible: true,
                                    order,
                                    type: 'status',
                                    newStatus: order.status
                                  })}
                                >
                                  <CIcon icon={cilCheckCircle} className="me-2" />
                                  Cập nhật trạng thái
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => setStatusModal({
                                    visible: true,
                                    order,
                                    type: 'payment',
                                    newStatus: order.paymentStatus
                                  })}
                                >
                                  <CIcon icon={cilMoney} className="me-2" />
                                  Cập nhật thanh toán
                                </CDropdownItem>
                              </CDropdownMenu>
                            </CDropdown>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  {/* Pagination */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Hiển thị {orders.length} trong tổng số {pagination.totalElements} đơn hàng
                    </div>
                    {renderPagination()}
                  </div>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Status Update Modal */}
      <CModal
        visible={statusModal.visible}
        onClose={() => setStatusModal({ visible: false, order: null, type: '', newStatus: '' })}
      >
        <CModalHeader>
          <CModalTitle>
            Cập nhật {statusModal.type === 'status' ? 'trạng thái đơn hàng' : 'trạng thái thanh toán'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {statusModal.order && (
            <div>
              <p><strong>Đơn hàng:</strong> #{statusModal.order.id}</p>
              <p><strong>Khách hàng:</strong> {statusModal.order.customerName}</p>
              <div className="mb-3">
                <label className="form-label">
                  {statusModal.type === 'status' ? 'Trạng thái mới' : 'Trạng thái thanh toán mới'}
                </label>
                <CFormSelect
                  value={statusModal.newStatus}
                  onChange={(e) => setStatusModal(prev => ({ ...prev, newStatus: e.target.value }))}
                >
                  {statusModal.type === 'status' ? (
                    <>
                      {Object.entries(ORDER_STATUS).map(([key, value]) => (
                        <option key={key} value={value}>
                          {ORDER_STATUS_LABELS[value]?.label || value}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
                        <option key={key} value={value}>
                          {PAYMENT_STATUS_LABELS[value]?.label || value}
                        </option>
                      ))}
                    </>
                  )}
                </CFormSelect>
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setStatusModal({ visible: false, order: null, type: '', newStatus: '' })}
          >
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleStatusUpdate} disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Order Details Modal */}
      <CModal
        size="lg"
        visible={detailModal.visible}
        onClose={() => setDetailModal({ visible: false, order: null, details: null })}
      >
        <CModalHeader>
          <CModalTitle>Chi tiết đơn hàng #{detailModal.order?.id}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {detailModal.order && detailModal.details && (
            <div>
              <CRow className="mb-3">
                <CCol md={6}>
                  <h6>Thông tin khách hàng</h6>
                  <p><strong>Tên:</strong> {detailModal.order.customerName}</p>
                  <p><strong>SĐT:</strong> {detailModal.order.customerPhone}</p>
                  <p><strong>Email:</strong> {detailModal.order.customerEmail}</p>
                </CCol>
                <CCol md={6}>
                  <h6>Thông tin đơn hàng</h6>
                  <p><strong>Ngày tạo:</strong> {formatDate(detailModal.order.createdAt)}</p>
                  <p><strong>Trạng thái:</strong> {getStatusBadge(detailModal.order.status, 'order')}</p>
                  <p><strong>Thanh toán:</strong> {getStatusBadge(detailModal.order.paymentStatus, 'payment')}</p>
                </CCol>
              </CRow>
              
              <h6>Sản phẩm</h6>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Sản phẩm</CTableHeaderCell>
                    <CTableHeaderCell>Số lượng</CTableHeaderCell>
                    <CTableHeaderCell>Giá</CTableHeaderCell>
                    <CTableHeaderCell>Thành tiền</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {detailModal.details.orderDetails?.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.productName}</CTableDataCell>
                      <CTableDataCell>{item.quantity}</CTableDataCell>
                      <CTableDataCell>{formatCurrency(item.price)}</CTableDataCell>
                      <CTableDataCell>{formatCurrency(item.quantity * item.price)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              
              <div className="text-end">
                <h5><strong>Tổng cộng: {formatCurrency(detailModal.order.totalAmount)}</strong></h5>
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDetailModal({ visible: false, order: null, details: null })}
          >
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default OrderList
