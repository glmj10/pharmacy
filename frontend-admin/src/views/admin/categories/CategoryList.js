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
  CFormSelect,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilOptions,
  cilPencil,
  cilTrash,
  cilPlus,
  cilSave,
  cilFolder,
  cilFolderOpen,
} from '@coreui/icons'
import { categoryService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const CategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState({ 
    visible: false, 
    category: null, 
    isEdit: false 
  })
  const [deleteModal, setDeleteModal] = useState({ visible: false, category: null })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { execute: callApi } = useApiCall()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  })

  const [thumbnailFile, setThumbnailFile] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await callApi(() => categoryService.getCategories())
      if (response.success) {
        // Handle both array and paginated response formats
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || response.data.data || []
        setCategories(categoriesData)
        console.log('Categories loaded:', categoriesData) // Debug log
      } else {
        setError('Không thể tải danh sách danh mục')
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Lỗi khi tải danh sách danh mục')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setThumbnailFile(e.target.files[0])
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      parentId: '',
    })
    setThumbnailFile(null)
    setFormModal({ visible: true, category: null, isEdit: false })
    setError('')
    setSuccess('')
  }

  const openEditModal = (category) => {
    setFormData({
      name: category.name || '',
      description: category.description || '',
      parentId: category.parentId || '',
    })
    setThumbnailFile(null)
    setFormModal({ visible: true, category, isEdit: true })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const submitFormData = new FormData()
      
      const categoryData = {
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || null,
      }
      
      submitFormData.append('category', JSON.stringify(categoryData))
      
      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile)
      }

      let response
      if (formModal.isEdit) {
        response = await callApi(() => 
          categoryService.updateCategory(formModal.category.id, submitFormData)
        )
      } else {
        response = await callApi(() => categoryService.createCategory(submitFormData))
      }

      if (response.success) {
        setSuccess(formModal.isEdit ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!')
        fetchCategories()
        setTimeout(() => {
          setFormModal({ visible: false, category: null, isEdit: false })
        }, 1500)
      }
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi lưu danh mục')
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteModal.category) return

    try {
      const response = await callApi(() => 
        categoryService.deleteCategory(deleteModal.category.id)
      )
      if (response.success) {
        setDeleteModal({ visible: false, category: null })
        fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const renderCategoryTree = (categories, level = 0) => {
    const parentCategories = categories.filter(cat => !cat.parentId)
    const childCategories = categories.filter(cat => cat.parentId)

    const getCategoryChildren = (parentId) => {
      return childCategories.filter(cat => cat.parentId === parentId)
    }

    const renderCategory = (category, level = 0) => {
      const children = getCategoryChildren(category.id)
      return (
        <React.Fragment key={category.id}>
          <CTableRow>
            <CTableDataCell>
              <div className="d-flex align-items-center" style={{ paddingLeft: `${level * 20}px` }}>
                <CIcon 
                  icon={children.length > 0 ? cilFolderOpen : cilFolder} 
                  className="me-2"
                />
                <img
                  src={category.thumbnail || '/placeholder-category.jpg'}
                  alt={category.name}
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  className="me-2"
                />
                <div>
                  <strong>{category.name}</strong>
                  <br />
                  <small className="text-muted">{category.slug}</small>
                </div>
              </div>
            </CTableDataCell>
            <CTableDataCell>
              {category.description && (
                <small className="text-muted">
                  {category.description.length > 100 
                    ? `${category.description.substring(0, 100)}...` 
                    : category.description
                  }
                </small>
              )}
            </CTableDataCell>
            <CTableDataCell>
              {category.parentId ? (
                <small className="text-muted">
                  {categories.find(c => c.id === category.parentId)?.name || 'N/A'}
                </small>
              ) : (
                <small className="text-primary">Danh mục gốc</small>
              )}
            </CTableDataCell>
            <CTableDataCell>
              <CDropdown>
                <CDropdownToggle color="ghost" caret={false}>
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => openEditModal(category)}>
                    <CIcon icon={cilPencil} className="me-2" />
                    Chỉnh sửa
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={() => setDeleteModal({ visible: true, category })}
                    className="text-danger"
                  >
                    <CIcon icon={cilTrash} className="me-2" />
                    Xóa
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CTableDataCell>
          </CTableRow>
          {children.map(child => renderCategory(child, level + 1))}
        </React.Fragment>
      )
    }

    return parentCategories.map(category => renderCategory(category))
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Quản lý danh mục</strong>
              <CButton 
                color="primary" 
                onClick={openCreateModal}
              >
                <CIcon icon={cilPlus} className="me-1" />
                Thêm danh mục
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
                      <CTableHeaderCell scope="col">Tên danh mục</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Mô tả</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Danh mục cha</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {renderCategoryTree(categories)}
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
        onClose={() => setFormModal({ visible: false, category: null, isEdit: false })}
      >
        <CModalHeader>
          <CModalTitle>
            {formModal.isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
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
                <CFormLabel htmlFor="name">Tên danh mục *</CFormLabel>
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
                <CFormLabel htmlFor="parentId">Danh mục cha</CFormLabel>
                <CFormSelect
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn danh mục cha (để trống nếu là danh mục gốc)</option>
                  {categories
                    .filter(cat => !cat.parentId && cat.id !== formModal.category?.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="description">Mô tả</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="thumbnail">Hình ảnh</CFormLabel>
                <CFormInput
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formModal.isEdit && formModal.category?.thumbnailUrl && (
                  <div className="mt-2">
                    <small className="text-muted">Hình ảnh hiện tại:</small>
                    <br />
                    <img
                      src={formModal.category.thumbnailUrl}
                      alt={formModal.category.name}
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="secondary" 
              onClick={() => setFormModal({ visible: false, category: null, isEdit: false })}
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
        onClose={() => setDeleteModal({ visible: false, category: null })}
      >
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa danh mục "{deleteModal.category?.name}"?
          <br />
          <small className="text-danger">
            Hành động này không thể hoàn tác và sẽ xóa tất cả danh mục con (nếu có).
          </small>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setDeleteModal({ visible: false, category: null })}
          >
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteCategory}>
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default CategoryList
