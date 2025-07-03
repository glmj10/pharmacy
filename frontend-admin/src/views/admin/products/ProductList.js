import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  CSpinner,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilOptions,
  cilPencil,
  cilTrash,
  cilPlus,
  cilToggleOn,
  cilToggleOff,
  cilReload,
} from '@coreui/icons'
import { useProducts } from '../../../hooks/useProducts'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { ProductEmptyState } from '../../../components/common/EmptyState'

const ProductList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ visible: false, product: null })
  const [error, setError] = useState('')
  
  const {
    products,
    loading,
    pagination,
    fetchProducts,
    deleteProduct,
    toggleProductStatus,
    refresh,
  } = useProducts()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async (page = 1, search = '') => {
    const params = {
      pageIndex: page,
      pageSize: 10,
      ...(search && { search }),
    }
    
    const result = await fetchProducts(params)
    
    if (!result.success) {
      setError('Không thể tải danh sách sản phẩm')
    } else {
      setError('')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadProducts(1, searchTerm)
  }

  const handlePageChange = (page) => {
    loadProducts(page, searchTerm)
  }

  const handleStatusToggle = async (productId, currentStatus) => {
    const result = await toggleProductStatus(productId, currentStatus)
    if (result.success) {
      // Refresh current page
      loadProducts(pagination.currentPage, searchTerm)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteModal.product) return

    const result = await deleteProduct(deleteModal.product.id)
    if (result.success) {
      setDeleteModal({ visible: false, product: null })
      // Refresh current page or go to previous page if current becomes empty
      const currentPage = products.length === 1 && pagination.currentPage > 1 
        ? pagination.currentPage - 1 
        : pagination.currentPage
      loadProducts(currentPage, searchTerm)
    }
  }

  const handleRefresh = () => {
    loadProducts(pagination.currentPage, searchTerm)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const getBadgeColor = (status) => {
    return status ? 'success' : 'danger'
  }

  const getStatusText = (status) => {
    return status ? 'Hoạt động' : 'Tạm dừng'
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Quản lý sản phẩm</strong>
              <div className="d-flex gap-2">
                <CButton 
                  color="light" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <CIcon icon={cilReload} className="me-1" />
                  Làm mới
                </CButton>
                <CButton 
                  color="primary" 
                  onClick={() => navigate('/admin/products/create')}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Thêm sản phẩm
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {error && (
                <CAlert color="danger" className="mb-3">
                  {error}
                </CAlert>
              )}
              
              {/* Search */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <form onSubmit={handleSearch}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <CInputGroupText>
                        <CButton type="submit" color="light">
                          <CIcon icon={cilSearch} />
                        </CButton>
                      </CInputGroupText>
                    </CInputGroup>
                  </form>
                </CCol>
              </CRow>

              {/* Table */}
              {loading ? (
                <LoadingSpinner text="Đang tải sản phẩm..." />
              ) : products.length === 0 ? (
                <ProductEmptyState 
                  isSearching={!!searchTerm}
                  onCreateNew={() => navigate('/admin/products/create')}
                  onRefresh={handleRefresh}
                />
              ) : (
                <>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Hình ảnh</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tên sản phẩm</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Giá</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Số lượng</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Thương hiệu</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Trạng thái</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {products.map((product) => (
                        <CTableRow key={product.id}>
                          <CTableDataCell>
                            <img
                              src={product.thumbnailUrl || '/placeholder-image.jpg'}
                              alt={product.title}
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg'
                              }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <strong>{product.title}</strong>
                              {product.slug && (
                                <>
                                  <br />
                                  <small className="text-muted">{product.slug}</small>
                                </>
                              )}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              {product.priceOld && product.priceOld !== product.priceNew && (
                                <div>
                                  <del className="text-muted">{formatPrice(product.priceOld)}</del>
                                </div>
                              )}
                              <strong className="text-success">
                                {formatPrice(product.priceNew)}
                              </strong>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={product.quantity > 0 ? 'success' : 'danger'}>
                              {product.quantity}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {product.manufacturer || 'N/A'}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getBadgeColor(product.active)}>
                              {getStatusText(product.active)}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CDropdown>
                              <CDropdownToggle color="ghost" caret={false} disabled={loading}>
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Chỉnh sửa
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => handleStatusToggle(product.id, product.active)}
                                >
                                  <CIcon 
                                    icon={product.active ? cilToggleOff : cilToggleOn} 
                                    className="me-2" 
                                  />
                                  {product.active ? 'Tạm dừng' : 'Kích hoạt'}
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => setDeleteModal({ visible: true, product })}
                                  className="text-danger"
                                >
                                  <CIcon icon={cilTrash} className="me-2" />
                                  Xóa
                                </CDropdownItem>
                              </CDropdownMenu>
                            </CDropdown>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <CPagination align="center" className="mt-3">
                      <CPaginationItem
                        disabled={!pagination.hasPrevious || loading}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                      >
                        Trước
                      </CPaginationItem>
                      {[...Array(pagination.totalPages)].map((_, index) => (
                        <CPaginationItem
                          key={index}
                          active={pagination.currentPage === index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          disabled={loading}
                        >
                          {index + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={!pagination.hasNext || loading}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                      >
                        Sau
                      </CPaginationItem>
                    </CPagination>
                  )}

                  {/* Show pagination info */}
                  {pagination.totalElements > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-muted">
                        Hiển thị {Math.min((pagination.currentPage - 1) * 10 + 1, pagination.totalElements)} - {' '}
                        {Math.min(pagination.currentPage * 10, pagination.totalElements)} trong tổng số{' '}
                        {pagination.totalElements} sản phẩm
                      </small>
                    </div>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, product: null })}
      >
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa sản phẩm "{deleteModal.product?.title}"?
          <br />
          <small className="text-danger">Hành động này không thể hoàn tác.</small>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setDeleteModal({ visible: false, product: null })}
          >
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteProduct}>
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProductList
