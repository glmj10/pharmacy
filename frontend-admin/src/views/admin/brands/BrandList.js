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
  CAlert,
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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { execute: callApi } = useApiCall()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const [logoFile, setLogoFile] = useState(null)

  const fetchBrands = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await callApi(() => brandService.getBrands())
      if (response.success) {
        // Handle both array and paginated response formats
        const brandsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || response.data.data || []
        setBrands(brandsData)
        console.log('Brands loaded:', brandsData) // Debug log
      } else {
        setError('Không thể tải danh sách thương hiệu')
        setBrands([])
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      setError('Lỗi khi tải danh sách thương hiệu')
      setBrands([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

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
    setError('')
    setSuccess('')
  }

  const openEditModal = (brand) => {
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
    })
    setLogoFile(null)
    setFormModal({ visible: true, brand, isEdit: true })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const submitFormData = new FormData()
      
      const brandData = {
        name: formData.name,
        description: formData.description,
      }
      
      submitFormData.append('brand', JSON.stringify(brandData))
      
      if (logoFile) {
        submitFormData.append('logo', logoFile)
      }

      let response
      if (formModal.isEdit) {
        response = await callApi(() => 
          brandService.updateBrand(formModal.brand.id, submitFormData)
        )
      } else {
        response = await callApi(() => brandService.createBrand(submitFormData))
      }

      if (response.success) {
        setSuccess(formModal.isEdit ? 'Cập nhật thương hiệu thành công!' : 'Tạo thương hiệu thành công!')
        fetchBrands()
        setTimeout(() => {
          setFormModal({ visible: false, brand: null, isEdit: false })
        }, 1500)
      }
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi lưu thương hiệu')
    }
  }

  const handleDeleteBrand = async () => {
    if (!deleteModal.brand) return

    try {
      const response = await callApi(() => 
        brandService.deleteBrand(deleteModal.brand.id)
      )
      if (response.success) {
        setDeleteModal({ visible: false, brand: null })
        fetchBrands()
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
    }
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
                        <CTableDataCell colSpan="4" className="text-center py-4">
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
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError('')}>
                {error}
              </CAlert>
            )}
            {success && (
              <CAlert color="success" dismissible onClose={() => setSuccess('')}>
                {success}
              </CAlert>
            )}

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

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="logo">Logo</CFormLabel>
                <CFormInput
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formModal.isEdit && formModal.brand?.logoUrl && (
                  <div className="mt-2">
                    <small className="text-muted">Logo hiện tại:</small>
                    <br />
                    <img
                      src={formModal.brand.logoUrl}
                      alt={formModal.brand.name}
                      style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                      className="border"
                    />
                  </div>
                )}
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
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default BrandList
