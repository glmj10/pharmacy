import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormSelect,
  CSpinner,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CFormFeedback,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilArrowLeft } from '@coreui/icons'
import { useProducts } from '../../../hooks/useProducts'
import { useFormSubmit } from '../../../hooks/useApiCall'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [error, setError] = useState('')

  const { submit, loading, validationErrors, clearValidationError } = useFormSubmit()
  const { getProductById, createProduct, updateProduct } = useProducts()

  const [formData, setFormData] = useState({
    title: '',
    priceOld: '',
    priceNew: '',
    quantity: '',
    manufacturer: '',
    type: '',
    noted: '',
    indication: '',
    description: '',
    registrationNumber: '',
    activeIngredient: '',
    dosageForm: '',
    priority: 0,
    active: true,
  })

  const [files, setFiles] = useState({
    thumbnail: null,
    images: [],
  })

  const [previewUrls, setPreviewUrls] = useState({
    thumbnail: '',
    images: [],
  })

  // Load product data for editing
  useEffect(() => {
    if (isEdit && id) {
      loadProduct()
    }
  }, [isEdit, id])

  const loadProduct = async () => {
    setInitialLoading(true)
    try {
      const result = await getProductById(id)
      if (result.success) {
        const productData = result.data
        setFormData({
          title: productData.title || '',
          priceOld: productData.priceOld || '',
          priceNew: productData.priceNew || '',
          quantity: productData.quantity || '',
          manufacturer: productData.manufacturer || '',
          type: productData.type || '',
          noted: productData.noted || '',
          indication: productData.indication || '',
          description: productData.description || '',
          registrationNumber: productData.registrationNumber || '',
          activeIngredient: productData.activeIngredient || '',
          dosageForm: productData.dosageForm || '',
          priority: productData.priority || 0,
          active: productData.active !== undefined ? productData.active : true,
        })

        // Set existing thumbnail preview
        if (productData.thumbnailUrl) {
          setPreviewUrls(prev => ({
            ...prev,
            thumbnail: productData.thumbnailUrl
          }))
        }

        // Set existing images preview
        if (productData.images && productData.images.length > 0) {
          setPreviewUrls(prev => ({
            ...prev,
            images: productData.images.map(img => img.imageUrl)
          }))
        }
      } else {
        setError('Không thể tải thông tin sản phẩm')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      setError('Không thể tải thông tin sản phẩm')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      clearValidationError(name)
    }
  }

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files)
    
    if (type === 'thumbnail') {
      setFiles(prev => ({ ...prev, thumbnail: selectedFiles[0] }))
      
      // Create preview URL
      if (selectedFiles[0]) {
        const url = URL.createObjectURL(selectedFiles[0])
        setPreviewUrls(prev => ({ ...prev, thumbnail: url }))
      }
    } else if (type === 'images') {
      setFiles(prev => ({ ...prev, images: selectedFiles }))
      
      // Create preview URLs
      const urls = selectedFiles.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => ({ ...prev, images: urls }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Tên sản phẩm là bắt buộc'
    }
    
    if (!formData.priceNew || formData.priceNew <= 0) {
      errors.priceNew = 'Giá bán phải lớn hơn 0'
    }
    
    if (!formData.quantity || formData.quantity < 0) {
      errors.quantity = 'Số lượng phải >= 0'
    }

    if (!isEdit && !files.thumbnail) {
      errors.thumbnail = 'Hình ảnh đại diện là bắt buộc'
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      // Show first error
      setError(Object.values(errors)[0])
      return { success: false, data: null }
    }

    // Create FormData
    const formDataToSend = new FormData()
    
    // Add product data as JSON
    const productRequest = {
      ...formData,
      priceOld: formData.priceOld ? parseInt(formData.priceOld) : null,
      priceNew: parseInt(formData.priceNew),
      quantity: parseInt(formData.quantity),
      priority: parseInt(formData.priority),
    }
    
    formDataToSend.append('product', JSON.stringify(productRequest))
    
    // Add files
    if (files.thumbnail) {
      formDataToSend.append('thumbnail', files.thumbnail)
    }
    
    if (files.images && files.images.length > 0) {
      files.images.forEach((image) => {
        formDataToSend.append('images', image)
      })
    }

    const result = await submit(
      () => isEdit 
        ? updateProduct(id, formDataToSend)
        : createProduct(formDataToSend),
      {
        successMessage: isEdit ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công',
        onSuccess: () => {
          navigate('/admin/products')
        }
      }
    )

    return result
  }

  if (initialLoading) {
    return (
      <LoadingSpinner 
        text="Đang tải thông tin sản phẩm..." 
        className="py-5"
      />
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</strong>
            <CButton 
              color="light" 
              onClick={() => navigate('/admin/products')}
            >
              <CIcon icon={cilArrowLeft} className="me-1" />
              Quay lại
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" className="mb-3">
                {error}
              </CAlert>
            )}
            
            <CForm onSubmit={handleSubmit}>
              <CRow>
                {/* Basic Information */}
                <CCol md={8}>
                  <h6 className="border-bottom pb-2 mb-3">Thông tin cơ bản</h6>
                  
                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CFormLabel htmlFor="title">Tên sản phẩm *</CFormLabel>
                      <CFormInput
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        invalid={!!validationErrors.title}
                      />
                      <CFormFeedback invalid>{validationErrors.title}</CFormFeedback>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="priceOld">Giá cũ</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          id="priceOld"
                          name="priceOld"
                          type="number"
                          value={formData.priceOld}
                          onChange={handleInputChange}
                          invalid={!!validationErrors.priceOld}
                        />
                        <CInputGroupText>₫</CInputGroupText>
                      </CInputGroup>
                      <CFormFeedback invalid>{validationErrors.priceOld}</CFormFeedback>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="priceNew">Giá bán *</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          id="priceNew"
                          name="priceNew"
                          type="number"
                          value={formData.priceNew}
                          onChange={handleInputChange}
                          invalid={!!validationErrors.priceNew}
                        />
                        <CInputGroupText>₫</CInputGroupText>
                      </CInputGroup>
                      <CFormFeedback invalid>{validationErrors.priceNew}</CFormFeedback>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="quantity">Số lượng *</CFormLabel>
                      <CFormInput
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        invalid={!!validationErrors.quantity}
                      />
                      <CFormFeedback invalid>{validationErrors.quantity}</CFormFeedback>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="manufacturer">Nhà sản xuất</CFormLabel>
                      <CFormInput
                        id="manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="type">Loại sản phẩm</CFormLabel>
                      <CFormInput
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="dosageForm">Dạng bào chế</CFormLabel>
                      <CFormInput
                        id="dosageForm"
                        name="dosageForm"
                        value={formData.dosageForm}
                        onChange={handleInputChange}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CFormLabel htmlFor="activeIngredient">Hoạt chất</CFormLabel>
                      <CFormInput
                        id="activeIngredient"
                        name="activeIngredient"
                        value={formData.activeIngredient}
                        onChange={handleInputChange}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CFormLabel htmlFor="registrationNumber">Số đăng ký</CFormLabel>
                      <CFormInput
                        id="registrationNumber"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CFormLabel htmlFor="indication">Chỉ định</CFormLabel>
                      <CFormTextarea
                        id="indication"
                        name="indication"
                        rows={3}
                        value={formData.indication}
                        onChange={handleInputChange}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CFormLabel htmlFor="noted">Ghi chú</CFormLabel>
                      <CFormTextarea
                        id="noted"
                        name="noted"
                        rows={3}
                        value={formData.noted}
                        onChange={handleInputChange}
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
                </CCol>

                {/* Settings & Images */}
                <CCol md={4}>
                  <h6 className="border-bottom pb-2 mb-3">Cài đặt & Hình ảnh</h6>
                  
                  <div className="mb-3">
                    <CFormLabel htmlFor="priority">Độ ưu tiên</CFormLabel>
                    <CFormInput
                      id="priority"
                      name="priority"
                      type="number"
                      value={formData.priority}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <CFormLabel htmlFor="active">Trạng thái</CFormLabel>
                    <CFormSelect
                      id="active"
                      name="active"
                      value={formData.active}
                      onChange={handleInputChange}
                    >
                      <option value={true}>Hoạt động</option>
                      <option value={false}>Tạm dừng</option>
                    </CFormSelect>
                  </div>

                  {/* Thumbnail */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="thumbnail">
                      Hình ảnh đại diện {!isEdit && '*'}
                    </CFormLabel>
                    <CFormInput
                      id="thumbnail"
                      name="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'thumbnail')}
                      invalid={!!validationErrors.thumbnail}
                    />
                    <CFormFeedback invalid>{validationErrors.thumbnail}</CFormFeedback>
                    
                    {previewUrls.thumbnail && (
                      <div className="mt-2">
                        <img
                          src={previewUrls.thumbnail}
                          alt="Thumbnail preview"
                          style={{
                            width: '100%',
                            maxWidth: '200px',
                            height: 'auto',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="images">Hình ảnh bổ sung</CFormLabel>
                    <CFormInput
                      id="images"
                      name="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'images')}
                    />
                    
                    {previewUrls.images.length > 0 && (
                      <div className="mt-2">
                        <div className="row g-2">
                          {previewUrls.images.map((url, index) => (
                            <div key={index} className="col-6">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '80px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CCol>
              </CRow>

              {/* Form Actions */}
              <div className="border-top pt-3 mt-4">
                <div className="d-flex gap-2">
                  <CButton
                    type="submit"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <CSpinner size="sm" className="me-1" />
                        {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
                      </>
                    ) : (
                      <>
                        <CIcon icon={cilSave} className="me-1" />
                        {isEdit ? 'Cập nhật' : 'Tạo mới'}
                      </>
                    )}
                  </CButton>
                  <CButton
                    type="button"
                    color="secondary"
                    onClick={() => navigate('/admin/products')}
                    disabled={loading}
                  >
                    Hủy
                  </CButton>
                </div>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProductForm
