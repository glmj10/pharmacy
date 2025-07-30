import React, { useState, useEffect, useCallback } from 'react'
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
  CDropdownDivider,
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
  CButtonGroup,
  CForm,
  CFormCheck,
  CSpinner,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster,
  CCollapse,
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
  cilFilter,
  cilReload,
  cilPrint,
  cilCloudDownload,
  cilLocationPin,
  cilUser,
  cilPhone,
  cilEnvelopeClosed,
  cilCalendar,
  cilX,
  cilPlus,
  cilMinus,
} from '@coreui/icons'
import { useOrders } from '../../../hooks/useOrders'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS, PAYMENT_STATUS } from '../../../config/constants'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [phoneFilter, setPhoneFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [toasts, setToasts] = useState([])

  const [statusModal, setStatusModal] = useState({ 
    visible: false, 
    order: null, 
    type: '', 
    newStatus: '' 
  })
  const [detailModal, setDetailModal] = useState({ 
    visible: false, 
    order: null, 
    details: null 
  })
  const [bulkModal, setBulkModal] = useState({
    visible: false,
    type: '', 
    newStatus: ''
  })

  const [searchDebounce, setSearchDebounce] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }
    
    const timeout = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput)
        loadOrders(1, searchInput, statusFilter, paymentFilter, phoneFilter, dateFromFilter, dateToFilter)
      }
    }, 500)
    
    setSearchDebounce(timeout)
    
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    resetToFirstPage()
  }, [statusFilter, paymentFilter, phoneFilter, dateFromFilter, dateToFilter])

  const loadOrders = async (page = 1, orderId = '', statusF = '', paymentF = '', phone = '', fromDate = '', toDate = '') => {
    try {
      const params = {
        pageIndex: page, 
        pageSize: 10
      }
      
      if (orderId.trim()) {
        const orderIdNum = parseInt(orderId.trim())
        if (!isNaN(orderIdNum)) {
          params.id = orderIdNum
        }
      }
      
      if (statusF) {
        params.orderStatus = statusF
      }
      
      if (paymentF) {
        params.paymentStatus = paymentF
      }
      
      if (phone.trim()) {
        params.customerPhoneNumber = phone.trim()
      }
      
      if (fromDate) {
        params.fromDate = fromDate
      }
      if (toDate) {
        params.toDate = toDate
      }

      await getOrders(params)
    } catch (error) {
      console.error('Failed to load orders:', error)
      addToast('Lỗi khi tải danh sách đơn hàng', 'error')
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchTerm(searchInput)
    loadOrders(1, searchInput, statusFilter, paymentFilter, phoneFilter, dateFromFilter, dateToFilter) 
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchTerm('')
    setStatusFilter('')
    setPaymentFilter('')
    setPhoneFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    loadOrders(1, '', '', '', '', '', '') 
  }

  const handlePageChange = (page) => {
    if (page !== pagination.currentPage && page >= 1 && page <= pagination.totalPages) {
      loadOrders(page, searchTerm, statusFilter, paymentFilter, phoneFilter, dateFromFilter, dateToFilter)
    }
  }

  const handleRefresh = () => {
    const currentPageToLoad = pagination.currentPage || 1
    loadOrders(currentPageToLoad, searchTerm, statusFilter, paymentFilter, phoneFilter, dateFromFilter, dateToFilter)
  }

  const resetToFirstPage = () => {
    loadOrders(1, searchTerm, statusFilter, paymentFilter, phoneFilter, dateFromFilter, dateToFilter)
  }

  const handleStatusUpdate = async () => {
    if (!statusModal.order || !statusModal.newStatus) return

    try {
      if (statusModal.type === 'status') {
        await updateOrderStatus(statusModal.order.id, statusModal.newStatus)
        addToast('Cập nhật trạng thái đơn hàng thành công', 'success')
      } else {
        await updatePaymentStatus(statusModal.order.id, statusModal.newStatus)
        addToast('Cập nhật trạng thái thanh toán thành công', 'success')
      }
      
      setStatusModal({ visible: false, order: null, type: '', newStatus: '' })
    } catch (error) {
      console.error('Error updating status:', error)
      addToast('Lỗi khi cập nhật trạng thái', 'error')
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkModal.type || !bulkModal.newStatus || selectedOrders.length === 0) return

    try {
      const promises = selectedOrders.map(orderId => {
        if (bulkModal.type === 'status') {
          return updateOrderStatus(orderId, bulkModal.newStatus)
        } else {
          return updatePaymentStatus(orderId, bulkModal.newStatus)
        }
      })

      await Promise.all(promises)
      addToast(`Cập nhật ${selectedOrders.length} đơn hàng thành công`, 'success')
      setSelectedOrders([])
      setBulkModal({ visible: false, type: '', newStatus: '' })
    } catch (error) {
      console.error('Error in bulk update:', error)
      addToast('Lỗi khi cập nhật hàng loạt', 'error')
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId, checked) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  const isAllSelected = selectedOrders.length === orders.length && orders.length > 0
  const isIndeterminate = selectedOrders.length > 0 && selectedOrders.length < orders.length

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
      addToast('Lỗi khi tải chi tiết đơn hàng', 'error')
    }
  }

  const addToast = useCallback((message, type = 'info') => {
    const toast = {
      id: Date.now(),
      message,
      type,
      autohide: true,
      delay: 4000
    }
    setToasts(prev => [...prev, toast])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
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
      <CBadge color={config.color} className="px-2 py-1">
        {config.label}
      </CBadge>
    )
  }

  const getCustomerInfo = (order) => {
    return {
      name: order.customerName || 'N/A',
      phone: order.customerPhoneNumber || 'N/A',
      address: order.customerAddress || 'N/A',
    }
  }

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    const items = []
    const currentPage = pagination.currentPage
    const totalPages = pagination.totalPages
    const maxVisiblePages = 5 
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages)
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
    }

    items.push(
      <CPaginationItem
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        title="Trang trước"
      >
        Trước
      </CPaginationItem>
    )

    if (startPage > 1) {
      items.push(
        <CPaginationItem
          key={1}
          onClick={() => handlePageChange(1)}
          style={{ cursor: 'pointer' }}
          title="Trang 1"
        >
          1
        </CPaginationItem>
      )

      if (startPage > 2) {
        items.push(
          <CPaginationItem key="start-ellipsis" disabled>
            ...
          </CPaginationItem>
        )
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <CPaginationItem
          key={page}
          active={currentPage === page}
          onClick={() => handlePageChange(page)}
          style={{ cursor: 'pointer' }}
          title={`Trang ${page}`}
        >
          {page}
        </CPaginationItem>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <CPaginationItem key="end-ellipsis" disabled>
            ...
          </CPaginationItem>
        )
      }

      items.push(
        <CPaginationItem
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          style={{ cursor: 'pointer' }}
          title={`Trang ${totalPages}`}
        >
          {totalPages}
        </CPaginationItem>
      )
    }

    items.push(
      <CPaginationItem
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        title="Trang sau"
      >
        Sau
      </CPaginationItem>
    )

    return <CPagination align="center" className="mt-3">{items}</CPagination>
  }

  const printOrderDetails = async (order, orderDetails) => {
    try {
      setPdfLoading(true)
      addToast('Đang tạo bảng văn bản...', 'info')
      
      const customer = getCustomerInfo(order)
      
      const textContent = `
===============================================================================
                       PHARMACY ADMIN - HÓA ĐƠN BÁN HÀNG
===============================================================================

Số hóa đơn: #${String(order.id).padStart(6, '0')}
Ngày tạo: ${formatDate(order.createdAt)}

-------------------------------------------------------------------------------
THÔNG TIN KHÁCH HÀNG
-------------------------------------------------------------------------------
Tên khách hàng: ${customer.name}
Số điện thoại: ${customer.phone}
Địa chỉ: ${customer.address || 'Không có địa chỉ'}

-------------------------------------------------------------------------------
THÔNG TIN ĐƠN HÀNG
-------------------------------------------------------------------------------
Trạng thái: ${ORDER_STATUS_LABELS[order.status]?.label || order.status}
Thanh toán: ${PAYMENT_STATUS_LABELS[order.paymentStatus]?.label || order.paymentStatus}
Phương thức: ${order.paymentMethod || 'Chưa xác định'}

-------------------------------------------------------------------------------
CHI TIẾT SẢN PHẨM
-------------------------------------------------------------------------------
${'Sản phẩm'.padEnd(40)} ${'SL'.padEnd(8)} ${'Đơn giá'.padEnd(15)} ${'Thành tiền'.padEnd(15)}
===============================================================================
${orderDetails.map(item => {
  const productName = (item.product?.title || 'N/A').length > 38 
    ? (item.product?.title || 'N/A').substring(0, 35) + '...'
    : (item.product?.title || 'N/A');
  const quantity = String(item.quantity);
  const unitPrice = formatCurrency(item.priceAtOrder);
  const totalPrice = formatCurrency(item.quantity * item.priceAtOrder);
  
  return `${productName.padEnd(40)} ${quantity.padEnd(8)} ${unitPrice.padEnd(15)} ${totalPrice.padEnd(15)}`;
}).join('\n')}
===============================================================================

Tổng cộng: ${formatCurrency(order.totalPrice)}

${order.note ? `
-------------------------------------------------------------------------------
GHI CHÚ
-------------------------------------------------------------------------------
${order.note}
` : ''}

===============================================================================
Cảm ơn quý khách đã tin tưởng và mua hàng!
Thời gian xuất: ${formatDate(new Date())}
===============================================================================
      `.trim()
      
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn #${order.id}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                margin: 20px;
                white-space: pre-wrap;
                background: white;
                color: black;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>${textContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      
      setTimeout(() => {
        printWindow.print()
      }, 500)
      
      addToast('Mở cửa sổ in thành công!', 'success')
      
    } catch (error) {
      console.error('Error printing order details:', error)
      addToast('Lỗi khi in văn bản', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  const handlePrintPDF = async () => {
    if (!detailModal.order || !detailModal.details) return
    
    await printOrderDetails(detailModal.order, detailModal.details)
  }

  const handleQuickPrint = async (order) => {
    try {
      setPdfLoading(true)
      const details = await getOrderDetails(order.id)
      await printOrderDetails(order, details)
    } catch (error) {
      console.error('Error in quick print:', error)
      addToast('Lỗi khi in văn bản', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleBulkPrint = async () => {
    if (selectedOrders.length === 0) return
    
    try {
      setPdfLoading(true)
      addToast(`Đang tạo ${selectedOrders.length} hóa đơn văn bản...`, 'info')
      
      const selectedOrderData = orders.filter(order => selectedOrders.includes(order.id))
      
      for (let i = 0; i < selectedOrderData.length; i++) {
        const order = selectedOrderData[i]
        try {
          const details = await getOrderDetails(order.id)
          await printOrderDetails(order, details)
          
          if (i < selectedOrderData.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } catch (error) {
          console.error(`Error printing order ${order.id}:`, error)
          addToast(`Lỗi khi in hóa đơn #${order.id}`, 'error')
        }
      }
      
      addToast(`Hoàn thành in ${selectedOrderData.length} hóa đơn`, 'success')
      
    } catch (error) {
      console.error('Error in bulk print:', error)
      addToast('Lỗi khi in hàng loạt', 'error')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading && orders.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <>
      {/* Toast notifications */}
      <CToaster className="p-3" placement="top-end">
        {toasts.map((toast) => (
          <CToast
            key={toast.id}
            autohide={toast.autohide}
            delay={toast.delay}
            visible={true}
            color={toast.type === 'success' ? 'success' : toast.type === 'error' ? 'danger' : 'info'}
            onClose={() => removeToast(toast.id)}
          >
            <CToastHeader closeButton>
              <strong className="me-auto">
                {toast.type === 'success' ? 'Thành công' : toast.type === 'error' ? 'Lỗi' : 'Thông báo'}
              </strong>
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">
                    <CIcon icon={cilCart} className="me-2" />
                    Quản lý đơn hàng
                  </h5>
                  <small className="text-muted">
                    Tổng {pagination.totalElements} đơn hàng
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <CButton 
                    color="primary" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <CIcon icon={cilReload} className="me-1" />
                    Làm mới
                  </CButton>
                  <CButton 
                    color="info" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <CIcon icon={cilFilter} className="me-1" />
                    Lọc
                  </CButton>
                  {selectedOrders.length > 0 && (
                    <CButtonGroup>
                      <CDropdown>
                        <CDropdownToggle color="warning" size="sm">
                          Thao tác ({selectedOrders.length})
                        </CDropdownToggle>
                        <CDropdownMenu>
                          <CDropdownItem
                            onClick={() => setBulkModal({ visible: true, type: 'status', newStatus: '' })}
                          >
                            <CIcon icon={cilCheckCircle} className="me-2" />
                            Cập nhật trạng thái đơn hàng
                          </CDropdownItem>
                          <CDropdownItem
                            onClick={() => setBulkModal({ visible: true, type: 'payment', newStatus: '' })}
                          >
                            <CIcon icon={cilMoney} className="me-2" />
                            Cập nhật thanh toán
                          </CDropdownItem>
                          <CDropdownDivider />
                          <CDropdownItem
                            onClick={handleBulkPrint}
                            disabled={pdfLoading}
                          >
                            <CIcon icon={cilPrint} className="me-2" />
                            In tất cả văn bản
                          </CDropdownItem>
                        </CDropdownMenu>
                      </CDropdown>
                    </CButtonGroup>
                  )}
                </div>
              </div>
            </CCardHeader>
            <CCardBody>
              {/* Search and Filter Section */}
              <div className="mb-4">
                <CForm onSubmit={handleSearchSubmit}>
                  <CRow className="g-3">
                    <CCol md={8}>
                      <CInputGroup>
                        <CFormInput
                          placeholder="Tìm kiếm theo mã đơn hàng (ID)..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          type="number"
                          min="1"
                        />
                        <CButton type="submit" color="primary" disabled={loading}>
                          <CIcon icon={cilSearch} />
                        </CButton>
                        {(searchInput || statusFilter || paymentFilter || phoneFilter || dateFromFilter || dateToFilter) && (
                          <CButton 
                            type="button" 
                            color="secondary" 
                            variant="outline"
                            onClick={handleClearSearch}
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        )}
                      </CInputGroup>
                    </CCol>
                  </CRow>
                </CForm>

                {/* Advanced Filters */}
                <CCollapse visible={showFilters}>
                  <CCard className="mt-3 border-0 bg-light">
                    <CCardBody>
                      <CRow className="g-3">
                        <CCol md={6}>
                          <label className="form-label">Trạng thái đơn hàng</label>
                          <CFormSelect
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="">Tất cả trạng thái</option>
                            {Object.entries(ORDER_STATUS).map(([key, value]) => (
                              <option key={key} value={value}>
                                {ORDER_STATUS_LABELS[value]?.label || value}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Trạng thái thanh toán</label>
                          <CFormSelect
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                          >
                            <option value="">Tất cả thanh toán</option>
                            {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
                              <option key={key} value={value}>
                                {PAYMENT_STATUS_LABELS[value]?.label || value}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Số điện thoại khách hàng</label>
                          <CFormInput
                            placeholder="Nhập số điện thoại..."
                            value={phoneFilter}
                            onChange={(e) => setPhoneFilter(e.target.value)}
                            type="tel"
                          />
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Từ ngày</label>
                          <CFormInput
                            type="datetime-local"
                            value={dateFromFilter}
                            onChange={(e) => setDateFromFilter(e.target.value)}
                          />
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label">Đến ngày</label>
                          <CFormInput
                            type="datetime-local"
                            value={dateToFilter}
                            onChange={(e) => setDateToFilter(e.target.value)}
                          />
                        </CCol>
                        <CCol md={6} className="d-flex align-items-end">
                          <CButton 
                            color="danger" 
                            variant="outline" 
                            onClick={handleClearSearch}
                            className="w-100"
                          >
                            <CIcon icon={cilX} className="me-1" />
                            Xóa tất cả bộ lọc
                          </CButton>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCollapse>
                
                {/* Active Filters Display */}
                {(searchTerm || statusFilter || paymentFilter || phoneFilter || dateFromFilter || dateToFilter) && (
                  <div className="mt-3 p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <small className="text-info fw-bold me-2">Đang lọc theo:</small>
                      {searchTerm && (
                        <CBadge color="info" className="px-2 py-1">
                          Mã đơn: {searchTerm}
                        </CBadge>
                      )}
                      {statusFilter && (
                        <CBadge color="info" className="px-2 py-1">
                          Trạng thái: {ORDER_STATUS_LABELS[statusFilter]?.label || statusFilter}
                        </CBadge>
                      )}
                      {paymentFilter && (
                        <CBadge color="info" className="px-2 py-1">
                          Thanh toán: {PAYMENT_STATUS_LABELS[paymentFilter]?.label || paymentFilter}
                        </CBadge>
                      )}
                      {phoneFilter && (
                        <CBadge color="info" className="px-2 py-1">
                          SĐT: {phoneFilter}
                        </CBadge>
                      )}
                      {dateFromFilter && (
                        <CBadge color="info" className="px-2 py-1">
                          Từ: {new Date(dateFromFilter).toLocaleDateString('vi-VN')}
                        </CBadge>
                      )}
                      {dateToFilter && (
                        <CBadge color="info" className="px-2 py-1">
                          Đến: {new Date(dateToFilter).toLocaleDateString('vi-VN')}
                        </CBadge>
                      )}
                    </div>
                    <CButton 
                      size="sm" 
                      color="info" 
                      variant="outline" 
                      onClick={handleClearSearch}
                      className="mt-1"
                    >
                      <CIcon icon={cilX} className="me-1" />
                      Xóa tất cả bộ lọc
                    </CButton>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <CAlert color="danger" dismissible onClose={clearError} className="mb-4">
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilXCircle} className="me-2" />
                    {error}
                  </div>
                </CAlert>
              )}

              {/* Loading Spinner */}
              {loading && (
                <div className="text-center py-4">
                  <CSpinner color="primary" />
                  <div className="mt-2 text-muted">
                    {orders.length === 0 ? 'Đang tải dữ liệu...' : 'Đang cập nhật...'}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {isEmpty && !loading && (
                <EmptyState 
                  title="Không có đơn hàng"
                  description={
                    searchTerm || statusFilter || paymentFilter || phoneFilter || dateFromFilter || dateToFilter
                      ? `Không tìm thấy đơn hàng phù hợp với các bộ lọc đã chọn.`
                      : "Chưa có đơn hàng nào trong hệ thống."
                  }
                  icon={cilCart}
                />
              )}

              {/* Orders Table */}
              {!isEmpty && !loading && (
                <>
                  <div className="table-responsive">
                    <CTable align="middle" className="mb-0 border" hover>
                      <CTableHead className="bg-light">
                        <CTableRow>
                          <CTableHeaderCell className="text-center" style={{ width: '40px' }}>
                            <CFormCheck
                              checked={isAllSelected}
                              indeterminate={isIndeterminate}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                          </CTableHeaderCell>
                          <CTableHeaderCell>ID</CTableHeaderCell>
                          <CTableHeaderCell>Khách hàng</CTableHeaderCell>
                          <CTableHeaderCell>Tổng tiền</CTableHeaderCell>
                          <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                          <CTableHeaderCell>Thanh toán</CTableHeaderCell>
                          <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Thao tác</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {orders.map((order) => {
                          const customer = getCustomerInfo(order)
                          const isSelected = selectedOrders.includes(order.id)
                          
                          return (
                            <CTableRow key={order.id} className={isSelected ? 'table-active' : ''}>
                              <CTableDataCell className="text-center">
                                <CFormCheck
                                  checked={isSelected}
                                  onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="fw-semibold text-primary">#{order.id}</div>
                                <small className="text-muted">{order.note || 'Không có ghi chú'}</small>
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    <div className="avatar avatar-md bg-light rounded-circle d-flex align-items-center justify-content-center">
                                      <CIcon icon={cilUser} className="text-muted" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="fw-semibold">{customer.name}</div>
                                    <small className="text-muted d-flex align-items-center">
                                      <CIcon icon={cilPhone} size="sm" className="me-1" />
                                      {customer.phone}
                                    </small>
                                  </div>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="fw-bold text-success">
                                  {formatCurrency(order.totalPrice)}
                                </div>
                                <small className="text-muted">{order.paymentMethod || 'N/A'}</small>
                              </CTableDataCell>
                              <CTableDataCell>
                                {getStatusBadge(order.status, 'order')}
                              </CTableDataCell>
                              <CTableDataCell>
                                {getStatusBadge(order.paymentStatus, 'payment')}
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="d-flex align-items-center text-muted">
                                  <CIcon icon={cilCalendar} size="sm" className="me-1" />
                                  {formatDate(order.createdAt)}
                                </div>
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CDropdown>
                                  <CDropdownToggle 
                                    size="sm" 
                                    color="ghost" 
                                    caret={false}
                                    className="p-0"
                                  >
                                    <CIcon icon={cilOptions} />
                                  </CDropdownToggle>
                                  <CDropdownMenu>
                                    <CDropdownItem onClick={() => handleViewDetails(order)}>
                                      <CIcon icon={cilInfo} className="me-2" />
                                      Chi tiết
                                    </CDropdownItem>
                                    <CDropdownItem onClick={() => handleQuickPrint(order)}>
                                      <CIcon icon={cilPrint} className="me-2" />
                                      In văn bản
                                    </CDropdownItem>
                                    <CDropdownDivider />
                                    <CDropdownItem
                                      onClick={() => setStatusModal({
                                        visible: true,
                                        order,
                                        type: 'status',
                                        newStatus: order.status
                                      })}
                                    >
                                      <CIcon icon={cilCheckCircle} className="me-2" />
                                      Cập nhật trạng thái đơn hàng
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
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="text-muted">
                        Hiển thị {((pagination.currentPage - 1) * 10) + 1} - {Math.min(pagination.currentPage * 10, pagination.totalElements)} 
                        trong tổng số {pagination.totalElements} đơn hàng
                        {selectedOrders.length > 0 && (
                          <span className="ms-2 text-primary fw-bold">
                            ({selectedOrders.length} đã chọn)
                          </span>
                        )}
                      </div>
                      {renderPagination()}
                    </div>
                  )}
                  
                  {/* Show info even when no pagination */}
                  {pagination.totalPages <= 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="text-muted">
                        Hiển thị {orders.length} trong tổng số {pagination.totalElements} đơn hàng
                        {selectedOrders.length > 0 && (
                          <span className="ms-2 text-primary fw-bold">
                            ({selectedOrders.length} đã chọn)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={statusModal.type === 'status' ? cilCheckCircle : cilMoney} className="me-2" />
            Cập nhật {statusModal.type === 'status' ? 'trạng thái đơn hàng' : 'trạng thái thanh toán'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {statusModal.order && (
            <div>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <CIcon icon={cilCart} className="me-2 text-primary" />
                  <strong>Đơn hàng #{statusModal.order.id}</strong>
                </div>
                <div className="text-muted">
                  <div className="d-flex align-items-center mb-1">
                    <CIcon icon={cilUser} size="sm" className="me-2" />
                    {getCustomerInfo(statusModal.order).name}
                  </div>
                  <div className="d-flex align-items-center">
                    <CIcon icon={cilMoney} size="sm" className="me-2" />
                    {formatCurrency(statusModal.order.totalPrice)}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">
                  <strong>
                    {statusModal.type === 'status' ? 'Trạng thái mới' : 'Trạng thái thanh toán mới'}
                  </strong>
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

              <div className="alert alert-info d-flex align-items-center">
                <CIcon icon={cilInfo} className="me-2" />
                <small>
                  Thay đổi trạng thái sẽ được áp dụng ngay lập tức và không thể hoàn tác.
                </small>
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
          <CButton 
            color="primary" 
            onClick={handleStatusUpdate} 
            disabled={loading || !statusModal.newStatus}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Bulk Update Modal */}
      <CModal
        visible={bulkModal.visible}
        onClose={() => setBulkModal({ visible: false, type: '', newStatus: '' })}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={bulkModal.type === 'status' ? cilCheckCircle : cilMoney} className="me-2" />
            Cập nhật hàng loạt {bulkModal.type === 'status' ? 'trạng thái đơn hàng' : 'trạng thái thanh toán'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <div className="alert alert-warning d-flex align-items-center">
              <CIcon icon={cilInfo} className="me-2" />
              <div>
                <strong>Bạn đang cập nhật {selectedOrders.length} đơn hàng</strong>
                <br />
                <small>Thao tác này sẽ áp dụng cho tất cả đơn hàng đã chọn.</small>
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">
              <strong>
                {bulkModal.type === 'status' ? 'Trạng thái mới' : 'Trạng thái thanh toán mới'}
              </strong>
            </label>
            <CFormSelect
              value={bulkModal.newStatus}
              onChange={(e) => setBulkModal(prev => ({ ...prev, newStatus: e.target.value }))}
            >
              <option value="">Chọn trạng thái</option>
              {bulkModal.type === 'status' ? (
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
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setBulkModal({ visible: false, type: '', newStatus: '' })}
          >
            Hủy
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleBulkUpdate} 
            disabled={loading || !bulkModal.newStatus}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              `Cập nhật ${selectedOrders.length} đơn hàng`
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Order Details Modal */}
      <CModal
        size="xl"
        visible={detailModal.visible}
        onClose={() => setDetailModal({ visible: false, order: null, details: null })}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilInfo} className="me-2" />
            Chi tiết đơn hàng #{detailModal.order?.id}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {detailModal.order && detailModal.details && (
            <div>
              <CRow className="mb-4">
                <CCol md={6}>
                  <CCard className="h-100">
                    <CCardHeader className="bg-light">
                      <h6 className="mb-0">
                        <CIcon icon={cilUser} className="me-2" />
                        Thông tin khách hàng
                      </h6>
                    </CCardHeader>
                    <CCardBody>
                      {detailModal.order ? (
                        <div>
                          <p className="mb-2">
                            <strong>Tên:</strong> {detailModal.order.customerName || 'Không có tên'}
                          </p>
                          <p className="mb-2">
                            <strong>SĐT:</strong> {detailModal.order.customerPhoneNumber || 'Không có số điện thoại'}
                          </p>
                          <p className="mb-0">
                            <strong>Địa chỉ:</strong>
                            <br />
                            <span className="text-muted">
                              {detailModal.order.customerAddress || 'Không có địa chỉ'}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted">Không có thông tin khách hàng</p>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={6}>
                  <CCard className="h-100">
                    <CCardHeader className="bg-light">
                      <h6 className="mb-0">
                        <CIcon icon={cilCart} className="me-2" />
                        Thông tin đơn hàng
                      </h6>
                    </CCardHeader>
                    <CCardBody>
                      <p className="mb-2">
                        <strong>Ngày tạo:</strong> {formatDate(detailModal.order.createdAt)}
                      </p>
                      <p className="mb-2">
                        <strong>Trạng thái:</strong> {getStatusBadge(detailModal.order.status, 'order')}
                      </p>
                      <p className="mb-2">
                        <strong>Thanh toán:</strong> {getStatusBadge(detailModal.order.paymentStatus, 'payment')}
                      </p>
                      <p className="mb-2">
                        <strong>Phương thức:</strong> {detailModal.order.paymentMethod || 'N/A'}
                      </p>
                      <p className="mb-0">
                        <strong>Ghi chú:</strong>
                        <br />
                        <span className="text-muted">
                          {detailModal.order.note || 'Không có ghi chú'}
                        </span>
                      </p>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              
              <CCard>
                <CCardHeader className="bg-light">
                  <h6 className="mb-0">
                    <CIcon icon={cilCart} className="me-2" />
                    Sản phẩm đã đặt
                  </h6>
                </CCardHeader>
                <CCardBody className="p-0">
                  <div className="table-responsive">
                    <CTable className="mb-0" hover>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Sản phẩm</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Số lượng</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Giá</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Thành tiền</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {detailModal.details.map((item, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>
                              <div className="d-flex align-items-center">
                                <div className="me-3">
                                  <div className="avatar bg-light rounded d-flex align-items-center justify-content-center">
                                    <CIcon icon={cilCart} className="text-muted" />
                                  </div>
                                </div>
                                <div>
                                  <div className="fw-semibold">{item.product?.title || 'N/A'}</div>
                                  <small className="text-muted">{item.product?.type || 'N/A'}</small>
                                </div>
                              </div>
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CBadge color="info">{item.quantity}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(item.priceAtOrder)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              <strong>{formatCurrency(item.quantity * item.priceAtOrder)}</strong>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </CCardBody>
                <CCardBody className="border-top bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Tổng cộng:</strong>
                    </div>
                    <div>
                      <h5 className="mb-0 text-success">
                        {formatCurrency(detailModal.order.totalPrice)}
                      </h5>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
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
          <CButton 
            color="primary" 
            variant="outline" 
            onClick={handlePrintPDF}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Đang tạo văn bản...
              </>
            ) : (
              <>
                <CIcon icon={cilPrint} className="me-2" />
                In văn bản
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default OrderList
