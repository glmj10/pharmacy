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
  CFormSelect,
  CFormFeedback,
  CSpinner,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import {
  cilSave,
  cilArrowLeft,
  cilImagePlus,
} from '@coreui/icons'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { blogService, categoryService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const BlogForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  
  const { execute: callApi } = useApiCall()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
  })

  // Debug formData changes
  useEffect(() => {
  }, [formData])

  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    categoryId: '',
    thumbnail: '',
  })

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await callApi(() => categoryService.getBlogCategories())
        if (response.success) {
          const categoriesData = Array.isArray(response.data) 
            ? response.data 
            : response.data.content || response.data.data || []
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching blog categories:', error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (isEdit && categories.length > 0) {
      const fetchBlog = async () => {
        setLoading(true)
        try {
          const response = await callApi(() => blogService.getBlogById(id))
          if (response.success) {
            const blog = response.data

            // Handle different response structures
            let categoryId = ''
            if (blog.category && blog.category.id) {
              // New structure: { category: { id: 1, name: "..." } }
              categoryId = String(blog.category.id)
            } else if (blog.categoryId) {
              // Old structure: { categoryId: 1 }
              categoryId = String(blog.categoryId)
            } else {
              console.log('No category information found in blog data')
            }
            
            const newFormData = {
              title: blog.title || '',
              content: blog.content || '',
              categoryId: categoryId,
            }
            setFormData(newFormData)
            
            setThumbnailPreview(blog.thumbnail || '')
          }
        } catch (error) {
          console.error('Error fetching blog:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchBlog()
    }
  }, [id, isEdit, categories]) // Add categories as dependency

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleContentChange = (event, editor) => {
    const data = editor.getData()
    setFormData(prev => ({
      ...prev,
      content: data
    }))
  }

  const handleFileChange = (e) => {
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

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Tiêu đề là bắt buộc'
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Nội dung là bắt buộc'
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Danh mục là bắt buộc'
    }
    
    if (!isEdit && !thumbnailFile) {
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
      
      // Create blog request object to match backend BlogRequest
      const blogRequest = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: parseInt(formData.categoryId),
      }
      
      // Add blog data as JSON string for @RequestPart("blog")
      const blogBlob = new Blob([JSON.stringify(blogRequest)], { type: 'application/json' })
      submitFormData.append('blog', blogBlob)
      
      // Add thumbnail if provided
      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile)
      }
      
      if (isEdit) {
        await callApi(() => 
          blogService.updateBlog(id, submitFormData),
          {
            successMessage: 'Cập nhật bài viết thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              navigate('/blogs/list')
            }
          }
        )
      } else {
        await callApi(() => 
          blogService.createBlog(submitFormData),
          {
            successMessage: 'Tạo bài viết thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              navigate('/blogs/list')
            }
          }
        )
      }
    } catch (error) {
      console.error('Error saving blog:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner color="primary" size="lg" />
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{isEdit ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</strong>
            </div>
            <CButton 
              color="secondary" 
              onClick={() => navigate('/blogs/list')}
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
                    <CFormLabel htmlFor="title">Tiêu đề *</CFormLabel>
                    <CFormInput
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      invalid={!!formErrors.title}
                      placeholder="Nhập tiêu đề bài viết"
                    />
                    {formErrors.title && (
                      <CFormFeedback invalid>
                        {formErrors.title}
                      </CFormFeedback>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="content">Nội dung *</CFormLabel>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.content}
                      onChange={handleContentChange}
                      config={{
                        placeholder: 'Nhập nội dung bài viết...',
                        toolbar: {
                          items: [
                            'heading',
                            '|',
                            'bold',
                            'italic',
                            'link',
                            'bulletedList',
                            'numberedList',
                            '|',
                            'blockQuote',
                            'insertTable',
                            '|',
                            'imageUpload',
                            'undo',
                            'redo'
                          ]
                        },
                        language: 'vi'
                      }}
                    />
                    {formErrors.content && (
                      <div className="invalid-feedback d-block">
                        {formErrors.content}
                      </div>
                    )}
                  </div>
                </CCol>

                <CCol md={4}>
                  {/* Category */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="categoryId">Danh mục *</CFormLabel>
                    <CFormSelect
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      invalid={!!formErrors.categoryId}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </CFormSelect>
                    {formErrors.categoryId && (
                      <CFormFeedback invalid>
                        {formErrors.categoryId}
                      </CFormFeedback>
                    )}
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
                      onChange={handleFileChange}
                      invalid={!!formErrors.thumbnail}
                    />
                    {formErrors.thumbnail && (
                      <CFormFeedback invalid>
                        {formErrors.thumbnail}
                      </CFormFeedback>
                    )}
                    
                    {/* Preview */}
                    {thumbnailPreview && (
                      <div className="mt-3">
                        <img
                          src={thumbnailPreview}
                          alt="Preview"
                          style={{ 
                            width: '100%', 
                            height: '200px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}
                        />
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

export default BlogForm
