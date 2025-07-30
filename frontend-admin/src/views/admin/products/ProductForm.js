import React, { useState, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
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
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilArrowLeft, cilX } from '@coreui/icons'
import { productService, brandService, categoryService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const { execute: callApi } = useApiCall()

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
    brandId: '',
    categoryIds: [],
  })

  const [formErrors, setFormErrors] = useState({
    title: '',
    priceOld: '',
    priceNew: '',
    quantity: '',
    manufacturer: '',
    type: '',
    brandId: '',
    categoryIds: '',
    thumbnail: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true)
      try {
        const brandsResponse = await callApi(() => brandService.getAllBrands())
        if (brandsResponse.success) {
          const brandsData = Array.isArray(brandsResponse.data) 
            ? brandsResponse.data 
            : brandsResponse.data.content || brandsResponse.data.data || []
          setBrands(brandsData)
        }

        const categoriesResponse = await callApi(() => categoryService.getAllProductCategories())
        if (categoriesResponse.success) {
          const categoriesData = Array.isArray(categoriesResponse.data) 
            ? categoriesResponse.data 
            : categoriesResponse.data.content || categoriesResponse.data.data || []
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (isEdit && brands.length > 0 && categories.length > 0) {
      const fetchProduct = async () => {
        setLoading(true)
        try {
          const response = await callApi(() => productService.getProductById(id))
          if (response.success) {
            const product = response.data
            
            console.log('Loaded product data:', product)
            
            let brandId = ''
            if (product.brand && product.brand.id) {
              brandId = String(product.brand.id)
            } else if (product.brandId) {
              brandId = String(product.brandId)
            }

            let categoryIds = []
            if (product.categories && Array.isArray(product.categories)) {
              categoryIds = product.categories.map(cat => String(cat.id))
            } else if (product.categoryIds && Array.isArray(product.categoryIds)) {
              categoryIds = product.categoryIds.map(id => String(id))
            }
            
            const newFormData = {
              title: product.title || '',
              priceOld: product.priceOld || '',
              priceNew: product.priceNew || '',
              quantity: product.quantity || '',
              manufacturer: product.manufacturer || '',
              type: product.type || '',
              noted: product.noted || '',
              indication: product.indication || '',
              description: product.description || '',
              registrationNumber: product.registrationNumber || '',
              activeIngredient: product.activeIngredient || '',
              dosageForm: product.dosageForm || '',
              priority: product.priority || 0,
              brandId: brandId,
              categoryIds: categoryIds,
            }
            setFormData(newFormData)
            
            if (product.thumbnailUrl) {
              setThumbnailPreview(product.thumbnailUrl)
            }

            if (product.images && product.images.length > 0) {
              setExistingImages(product.images)
            }
          } else {
            console.error('Failed to load product:', response.message)
            navigate('/products')
          }
        } catch (error) {
          console.error('Error fetching product:', error)
          navigate('/products')
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    }
  }, [id, isEdit, brands, categories, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'categoryIds') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
      setFormData(prev => ({
        ...prev,
        categoryIds: selectedOptions
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setImageFiles(files)
      
      const previews = files.map(file => {
        const reader = new FileReader()
        return new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      })

      Promise.all(previews).then(urls => {
        setImagePreviews(urls)
      })
    }
  }

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index]
    if (imageToRemove && imageToRemove.id) {
      setRemovedImageIds(prev => [...prev, imageToRemove.id])
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview('')
  }

  const resetForm = () => {
    setFormData({
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
      brandId: '',
      categoryIds: [],
    })
    setThumbnailFile(null)
    setThumbnailPreview('')
    setImageFiles([])
    setImagePreviews([])
    setExistingImages([])
    setRemovedImageIds([])
    setFormErrors({})
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Tên sản phẩm là bắt buộc'
    }
    
    if (!formData.priceOld || formData.priceOld <= 0) {
      errors.priceOld = 'Giá gốc phải lớn hơn 0'
    }
    
    if (!formData.priceNew || formData.priceNew <= 0) {
      errors.priceNew = 'Giá mới phải lớn hơn 0'
    }
    
    if (!formData.quantity || formData.quantity < 0) {
      errors.quantity = 'Số lượng phải >= 0'
    }
    
    if (!formData.manufacturer.trim()) {
      errors.manufacturer = 'Nhà sản xuất là bắt buộc'
    }
    
    if (!formData.type.trim()) {
      errors.type = 'Loại sản phẩm là bắt buộc'
    }
    
    if (!formData.brandId) {
      errors.brandId = 'Thương hiệu là bắt buộc'
    }
    
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      errors.categoryIds = 'Danh mục là bắt buộc'
    }
    
    if (!isEdit && !thumbnailFile && !thumbnailPreview) {
      errors.thumbnail = 'Hình ảnh đại diện là bắt buộc'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      const submitFormData = new FormData()
      
      const productRequest = {
        title: formData.title.trim(),
        priceOld: parseFloat(formData.priceOld),
        priceNew: parseFloat(formData.priceNew),
        quantity: parseInt(formData.quantity),
        manufacturer: formData.manufacturer.trim(),
        type: formData.type.trim(),
        noted: formData.noted.trim(),
        indication: formData.indication.trim(),
        description: formData.description.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        activeIngredient: formData.activeIngredient.trim(),
        dosageForm: formData.dosageForm.trim(),
        priority: parseInt(formData.priority),
        brandId: parseInt(formData.brandId),
        categoryIds: formData.categoryIds.map(id => parseInt(id)),
      }
      
      const productBlob = new Blob([JSON.stringify(productRequest)], { type: 'application/json' })
      submitFormData.append('product', productBlob)
      
      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile)
      }
      
      imageFiles.forEach((file, index) => {
        submitFormData.append('images', file)
      })
      
      if (isEdit && removedImageIds.length > 0) {
        submitFormData.append('removedImageIds', JSON.stringify(removedImageIds))
      }
      
      if (isEdit) {
        await callApi(() => 
          productService.updateProduct(id, submitFormData),
          {
            successMessage: 'Cập nhật sản phẩm thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              navigate('/products/list')
            }
          }
        )
      } else {
        await callApi(() => 
          productService.createProduct(submitFormData),
          {
            successMessage: 'Tạo sản phẩm thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              navigate('/products/list')
            }
          }
        )
      }
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-2">Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (loading && isEdit) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" size="lg" />
        <span className="ms-2">Đang tải thông tin sản phẩm...</span>
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</strong>
            </div>
            <CButton 
              color="secondary" 
              onClick={() => navigate('/products/list')}
              className="me-2"
            >
              <CIcon icon={cilArrowLeft} className="me-1" />
              Quay lại
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={8}>
                  {/* Title */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="title">Tên sản phẩm *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      invalid={!!formErrors.title}
                      placeholder="Nhập tên sản phẩm"
                    />
                    {formErrors.title && (
                      <CFormFeedback invalid>
                        {formErrors.title}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Price */}
                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="priceOld">Giá gốc *</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            type="number"
                            id="priceOld"
                            name="priceOld"
                            value={formData.priceOld}
                            onChange={handleInputChange}
                            invalid={!!formErrors.priceOld}
                            placeholder="0"
                          />
                          <CInputGroupText>VND</CInputGroupText>
                        </CInputGroup>
                        {formErrors.priceOld && (
                          <CFormFeedback invalid>
                            {formErrors.priceOld}
                          </CFormFeedback>
                        )}
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="priceNew">Giá bán *</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            type="number"
                            id="priceNew"
                            name="priceNew"
                            value={formData.priceNew}
                            onChange={handleInputChange}
                            invalid={!!formErrors.priceNew}
                            placeholder="0"
                          />
                          <CInputGroupText>VND</CInputGroupText>
                        </CInputGroup>
                        {formErrors.priceNew && (
                          <CFormFeedback invalid>
                            {formErrors.priceNew}
                          </CFormFeedback>
                        )}
                      </div>
                    </CCol>
                  </CRow>

                  {/* Quantity */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="quantity">Số lượng *</CFormLabel>
                    <CFormInput
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      invalid={!!formErrors.quantity}
                      placeholder="0"
                    />
                    {formErrors.quantity && (
                      <CFormFeedback invalid>
                        {formErrors.quantity}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Manufacturer */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="manufacturer">Nhà sản xuất *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      invalid={!!formErrors.manufacturer}
                      placeholder="Nhập tên nhà sản xuất"
                    />
                    {formErrors.manufacturer && (
                      <CFormFeedback invalid>
                        {formErrors.manufacturer}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Type */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="type">Loại sản phẩm *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      invalid={!!formErrors.type}
                      placeholder="Nhập loại sản phẩm"
                    />
                    {formErrors.type && (
                      <CFormFeedback invalid>
                        {formErrors.type}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Description with CKEditor */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="description">Mô tả</CFormLabel>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.description}
                      onChange={(event, editor) => {
                        const data = editor.getData()
                        setFormData(prev => ({
                          ...prev,
                          description: data
                        }))
                      }}
                    />
                  </div>

                  {/* Noted */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="noted">Ghi chú</CFormLabel>
                    <CFormTextarea
                      id="noted"
                      name="noted"
                      value={formData.noted}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Nhập ghi chú"
                    />
                  </div>

                  {/* Indication */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="indication">Chỉ định</CFormLabel>
                    <CFormTextarea
                      id="indication"
                      name="indication"
                      value={formData.indication}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Nhập chỉ định sử dụng"
                    />
                  </div>

                  {/* Additional Fields */}
                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="registrationNumber">Số đăng ký</CFormLabel>
                        <CFormInput
                          type="text"
                          id="registrationNumber"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          placeholder="Nhập số đăng ký"
                        />
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="activeIngredient">Hoạt chất</CFormLabel>
                        <CFormInput
                          type="text"
                          id="activeIngredient"
                          name="activeIngredient"
                          value={formData.activeIngredient}
                          onChange={handleInputChange}
                          placeholder="Nhập hoạt chất"
                        />
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="dosageForm">Dạng bào chế</CFormLabel>
                        <CFormInput
                          type="text"
                          id="dosageForm"
                          name="dosageForm"
                          value={formData.dosageForm}
                          onChange={handleInputChange}
                          placeholder="Nhập dạng bào chế"
                        />
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="priority">Độ ưu tiên</CFormLabel>
                        <CFormInput
                          type="number"
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </div>
                    </CCol>
                  </CRow>
                </CCol>

                <CCol md={4}>
                  {/* Brand */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="brandId">Thương hiệu *</CFormLabel>
                    <CFormSelect
                      id="brandId"
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInputChange}
                      invalid={!!formErrors.brandId}
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </CFormSelect>
                    {formErrors.brandId && (
                      <CFormFeedback invalid>
                        {formErrors.brandId}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="categoryIds">Danh mục *</CFormLabel>
                    <CFormSelect
                      id="categoryIds"
                      name="categoryIds"
                      multiple
                      value={formData.categoryIds}
                      onChange={handleInputChange}
                      invalid={!!formErrors.categoryIds}
                      size={5}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </CFormSelect>
                    {formErrors.categoryIds && (
                      <CFormFeedback invalid>
                        {formErrors.categoryIds}
                      </CFormFeedback>
                    )}
                    <div className="form-text">
                      Giữ Ctrl để chọn nhiều danh mục
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="thumbnail">
                      Hình ảnh đại diện {!isEdit && '*'}
                    </CFormLabel>
                    <CFormInput
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      invalid={!!formErrors.thumbnail}
                    />
                    {formErrors.thumbnail && (
                      <CFormFeedback invalid>
                        {formErrors.thumbnail}
                      </CFormFeedback>
                    )}
                    
                    {/* Thumbnail Preview */}
                    {thumbnailPreview && (
                      <div className="mt-3 position-relative">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          style={{ 
                            width: '100%', 
                            height: '200px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}
                        />
                        <CButton
                          color="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-2"
                          onClick={removeThumbnail}
                        >
                          <CIcon icon={cilX} />
                        </CButton>
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="images">Hình ảnh sản phẩm</CFormLabel>
                    <CFormInput
                      type="file"
                      id="images"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                    />
                    
                    {existingImages.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted">Hình ảnh hiện tại:</small>
                        <div className="row mt-2">
                          {existingImages.map((image, index) => (
                            <div key={index} className="col-6 mb-2">
                              <div className="position-relative">
                                <img
                                  src={image.imageUrl}
                                  alt={`Existing ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6'
                                  }}
                                />
                                <CButton
                                  color="danger"
                                  size="sm"
                                  className="position-absolute top-0 end-0 m-1"
                                  onClick={() => removeExistingImage(index)}
                                >
                                  <CIcon icon={cilX} />
                                </CButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Images Preview */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-3">
                        <small className="text-muted">Hình ảnh mới:</small>
                        <div className="row mt-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="col-6 mb-2">
                              <div className="position-relative">
                                <img
                                  src={preview}
                                  alt={`New ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6'
                                  }}
                                />
                                <CButton
                                  color="danger"
                                  size="sm"
                                  className="position-absolute top-0 end-0 m-1"
                                  onClick={() => removeImage(index)}
                                >
                                  <CIcon icon={cilX} />
                                </CButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <CButton 
                      type="submit" 
                      color="primary" 
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilSave} className="me-2" />
                          {isEdit ? 'Cập nhật' : 'Tạo mới'}
                        </>
                      )}
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProductForm
