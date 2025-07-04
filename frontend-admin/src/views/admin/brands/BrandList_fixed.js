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
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CSpinner,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilOptions,
  cilPencil,
  cilTrash,
  cilPlus,
  cilSave,
  cilBuilding,
} from '@coreui/icons'
import { brandService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const BrandList = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState({ 
    visible: false, 
    brand: null, 
    isEdit: false 
  })
  const [deleteModal, setDeleteModal] = useState({ visible: false, brand: null })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const PAGE_SIZE = 10
  
  const { execute: callApi } = useApiCall()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const [logoFile, setLogoFile] = useState(null)

  const fetchBrands = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page: page - 1, // Backend uses 0-based indexing
        size: PAGE_SIZE,
      }
      
      const response = await callApi(() => brandService.getBrands(params))
      if (response.success) {
        const data = response.data
        setBrands(data.content || data.data || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
        setCurrentPage(page)
      } else {
        setBrands([])
        setTotalPages(0)
        setTotalElements(0)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      setBrands([])
      setTotalPages(0)
      setTotalElements(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchBrands(page)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0])
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
    })
    setLogoFile(null)
    setFormModal({ visible: true, brand: null, isEdit: false })
  }

  const openEditModal = (brand) => {
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
    })
    setLogoFile(null)
    setFormModal({ visible: true, brand, isEdit: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {      
      const brandData = {
        name: formData.name,
        description: formData.description,
      }

      let response
      if (formModal.isEdit) {
        response = await callApi(() => 
          brandService.updateBrand(formModal.brand.id, brandData),
          {
            successMessage: 'Cập nhật thương hiệu thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              fetchBrands(currentPage)
              setFormModal({ visible: false, brand: null, isEdit: false })
            }
          }
        )
      } else {
        response = await callApi(() => 
          brandService.createBrand(brandData),
          {
            successMessage: 'Tạo thương hiệu thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              fetchBrands(currentPage)
              setFormModal({ visible: false, brand: null, isEdit: false })
            }
          }
        )
      }
    } catch (error) {
      console.error('Error saving brand:', error)
    }
  }

  const handleDeleteBrand = async () => {
    if (!deleteModal.brand) return

    try {
      const response = await callApi(() => 
        brandService.deleteBrand(deleteModal.brand.id),
        {
          successMessage: 'Xóa thương hiệu thành công!',
          showSuccessNotification: true,
          onSuccess: () => {
            setDeleteModal({ visible: false, brand: null })
            fetchBrands(currentPage)
          }
        }
      )
    } catch (error) {
      console.error('Error deleting brand:', error)
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const items = []
    
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
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        items.push(
          <CPaginationItem
            key={i}
            active={i === currentPage}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </CPaginationItem>
        )
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        items.push(
          <CPaginationItem key={i} disabled>
            ...
          </CPaginationItem>
        )
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

    return (
      <CPagination aria-label="Page navigation" className="justify-content-center mt-3">
        {items}
      </CPagination>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Quản lý thương hiệu</strong>
              <CButton 
                color="primary" 
                onClick={openCreateModal}
              >
                <CIcon icon={cilPlus} className="me-1" />
                Thêm thương hiệu
              </CButton>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="text-center py-4">
                  <CSpinner color="primary" />
                </div>
              ) : (
                <>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Tên thương hiệu</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Mô tả</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Array.isArray(brands) && brands.length > 0 ? (
                        brands.map((brand) => (
                          <CTableRow key={brand.id}>
                            <CTableDataCell>
                              <div>
                                <strong>{brand.name}</strong>
                                <br />
                                <small className="text-muted">ID: {brand.id}</small>
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>
                              {brand.description && (
                                <div>
                                  {brand.description.length > 100 
                                    ? `${brand.description.substring(0, 100)}...` 
                                    : brand.description
                                  }
                                </div>
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CDropdown>
                                <CDropdownToggle color="ghost" caret={false}>
                                  <CIcon icon={cilOptions} />
                                </CDropdownToggle>
                                <CDropdownMenu>
                                  <CDropdownItem onClick={() => openEditModal(brand)}>
                                    <CIcon icon={cilPencil} className="me-2" />
                                    Chỉnh sửa
                                  </CDropdownItem>
                                  <CDropdownItem
                                    onClick={() => setDeleteModal({ visible: true, brand })}
                                    className="text-danger"
                                  >
                                    <CIcon icon={cilTrash} className="me-2" />
                                    Xóa
                                  </CDropdownItem>
                                </CDropdownMenu>
                              </CDropdown>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan="3" className="text-center py-4">
                            <div className="d-flex flex-column align-items-center">
                              <CIcon icon={cilBuilding} size="3xl" className="text-muted mb-3" />
                              <p>Chưa có thương hiệu nào</p>
                              <CButton color="primary" onClick={openCreateModal}>
                                <CIcon icon={cilPlus} className="me-2" />
                                Thêm thương hiệu đầu tiên
                              </CButton>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                  {renderPagination()}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Form Modal */}
      <CModal
        size="lg"
        visible={formModal.visible}
        onClose={() => setFormModal({ visible: false, brand: null, isEdit: false })}
      >
        <CModalHeader>
          <CModalTitle>
            {formModal.isEdit ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="name">Tên thương hiệu *</CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="description">Mô tả</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="secondary" 
              onClick={() => setFormModal({ visible: false, brand: null, isEdit: false })}
            >
              Hủy
            </CButton>
            <CButton color="primary" type="submit">
              <CIcon icon={cilSave} className="me-1" />
              {formModal.isEdit ? 'Cập nhật' : 'Tạo mới'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, brand: null })}
      >
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa thương hiệu "{deleteModal.brand?.name}"?
          <br />
          <small className="text-danger">
            Hành động này không thể hoàn tác.
          </small>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setDeleteModal({ visible: false, brand: null })}
          >
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteBrand}>
            <CIcon icon={cilTrash} className="me-1" />
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default BrandList
