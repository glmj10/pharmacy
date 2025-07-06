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
  CFormFeedback,
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
  cilCaretBottom,
  cilCaretRight,
} from '@coreui/icons'
import { categoryService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

// Modern CSS styles for animations and smooth transitions
const modernCategoryStyles = `
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .category-row {
      animation: slideIn 0.3s ease-out;
    }
    
    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
    }
    
    .category-thumbnail:hover {
      transform: scale(1.05);
    }
    
    .expand-btn:hover {
      transform: scale(1.1);
    }
    
    .action-toggle:hover {
      background-color: #e3f2fd !important;
      border-color: #2196f3 !important;
    }
    
    .dropdown-item:hover {
      background-color: #f5f5f5 !important;
      border-radius: 8px !important;
    }
    
    .tree-connector-vertical {
      animation: fadeIn 0.3s ease-out;
    }
    
    .tree-connector-horizontal {
      animation: fadeIn 0.3s ease-out;
    }
    
    .leaf-indicator {
      animation: pulse 2s infinite;
    }
    
    .folder-icon {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .folder-icon:hover {
      transform: scale(1.1);
    }
    
    .type-badge {
      transition: all 0.3s ease;
    }
    
    .type-badge:hover {
      transform: scale(1.05);
    }
    
    .level-indicator {
      transition: all 0.3s ease;
    }
    
    .level-indicator:hover {
      transform: scale(1.1);
    }
    
    .slug-badge {
      transition: all 0.2s ease;
    }
    
    .slug-badge:hover {
      background-color: #e0e0e0 !important;
    }
  </style>
`

const CategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState({ 
    visible: false, 
    category: null, 
    isEdit: false 
  })
  const [deleteModal, setDeleteModal] = useState({ visible: false, category: null })
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  
  const { execute: callApi } = useApiCall()

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    type: '',
  })

  const [formErrors, setFormErrors] = useState({
    name: '',
    type: '',
    thumbnail: '',
  })

  const [thumbnailFile, setThumbnailFile] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await callApi(() => categoryService.getCategories())
      if (response.success) {
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || response.data.data || []
        setCategories(categoriesData)
        
        // Mặc định thu gọn tất cả categories
        setExpandedCategories(new Set())
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
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
    
    // Real-time validation
    validateField(name, value)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Tên danh mục là bắt buộc'
    }

    if (!formData.type.trim()) {
      errors.type = 'Loại danh mục là bắt buộc'
    }

    // Validate thumbnail for create mode
    if (!formModal.isEdit && !thumbnailFile) {
      errors.thumbnail = 'Hình ảnh là bắt buộc khi tạo danh mục mới'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateField = (fieldName, value) => {
    const errors = { ...formErrors }
    
    if (fieldName === 'name') {
      if (!value.trim()) {
        errors.name = 'Tên danh mục là bắt buộc'
      } else {
        errors.name = ''
      }
    }
    
    if (fieldName === 'type') {
      if (!value.trim()) {
        errors.type = 'Loại danh mục là bắt buộc'
      } else {
        errors.type = ''
      }
    }
    
    setFormErrors(errors)
  }

  const isFormValid = () => {
    const basicValid = formData.name.trim() !== '' && formData.type.trim() !== ''
    
    // For create mode, thumbnail is also required
    if (!formModal.isEdit) {
      return basicValid && thumbnailFile !== null
    }
    
    return basicValid
  }

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const toggleAllCategories = () => {
    const getAllCategoryIds = (cats) => {
      let ids = []
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          ids.push(cat.id)
          ids.push(...getAllCategoryIds(cat.children))
        }
      })
      return ids
    }
    
    const allCategoryIds = getAllCategoryIds(categories)
    const isAnyExpanded = allCategoryIds.some(id => expandedCategories.has(id))
    
    if (isAnyExpanded) {
      setExpandedCategories(new Set())
    } else {
      setExpandedCategories(new Set(allCategoryIds))
    }
  }

  const handleFileChange = (e) => {
    setThumbnailFile(e.target.files[0])
    
    // Clear thumbnail error when file is selected
    if (e.target.files[0] && formErrors.thumbnail) {
      setFormErrors(prev => ({
        ...prev,
        thumbnail: ''
      }))
    }
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      parentId: '',
      type: 'PRODUCT',
    })
    setFormErrors({
      name: '',
      type: '',
      thumbnail: '',
    })
    setThumbnailFile(null)
    setFormModal({ visible: true, category: null, isEdit: false })
  }

  const openEditModal = (category) => {
    setFormData({
      name: category.name || '',
      parentId: category.parentId || '',
      type: category.type || 'PRODUCT',
    })
    setFormErrors({
      name: '',
      type: '',
      thumbnail: '',
    })
    setThumbnailFile(null)
    setFormModal({ visible: true, category, isEdit: true })
  }

  const flattenCategories = (categories) => {
    let flatCategories = []
    const flatten = (cats, level = 0) => {
      cats.forEach(cat => {
        flatCategories.push({
          ...cat,
          level: level,
          displayName: '　'.repeat(level) + cat.name
        })
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children, level + 1)
        }
      })
    }
    flatten(categories)
    return flatCategories
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitFormData = new FormData()
      
      // Create category request object to match backend CategoryRequest
      const categoryRequest = {
        name: formData.name.trim(),
        type: formData.type,
        parentId: formData.parentId || null,
      }
      
      // Add category data as JSON string with proper content type for @RequestPart("category")
      const categoryBlob = new Blob([JSON.stringify(categoryRequest)], { type: 'application/json' })
      submitFormData.append('category', categoryBlob)
      
      // Add thumbnail file for @RequestPart("thumbnail") - required for create, optional for update
      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile)
      } else if (!formModal.isEdit) {
        // For create mode, thumbnail is required
        alert('Vui lòng chọn hình ảnh cho danh mục')
        return
      }
      // For update mode, if no new thumbnail is selected, keep the existing one

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of submitFormData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('Category request object:', categoryRequest);

      // Don't set Content-Type header manually for FormData
      // Browser will automatically set multipart/form-data with boundary
      const config = {}

      if (formModal.isEdit) {
        await callApi(() => 
          categoryService.updateCategory(formModal.category.id, submitFormData, config),
          {
            successMessage: 'Cập nhật danh mục thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              fetchCategories()
              setTimeout(() => {
                setFormModal({ visible: false, category: null, isEdit: false })
              }, 1500)
            }
          }
        )
      } else {
        await callApi(() => 
          categoryService.createCategory(submitFormData, config),
          {
            successMessage: 'Tạo danh mục thành công!',
            showSuccessNotification: true,
            onSuccess: () => {
              fetchCategories()
              setTimeout(() => {
                setFormModal({ visible: false, category: null, isEdit: false })
              }, 1500)
            }
          }
        )
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteModal.category) return

    try {
      await callApi(() => 
        categoryService.deleteCategory(deleteModal.category.id),
        {
          successMessage: 'Xóa danh mục thành công!',
          showSuccessNotification: true,
          onSuccess: () => {
            setDeleteModal({ visible: false, category: null })
            fetchCategories()
          }
        }
      )
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  // Helper functions for styling
  const getTypeColor = (type) => {
    switch(type) {
      case 'PRODUCT': return '#4caf50'
      case 'BLOG': return '#2196f3'
      default: return '#757575'
    }
  }

  const getTypeText = (type) => {
    switch(type) {
      case 'PRODUCT': return 'Sản phẩm'
      case 'BLOG': return 'Bài viết'
      default: return type
    }
  }

  const renderCategoryTree = (categories, level = 0) => {
    if (!categories || categories.length === 0) {
      return (
        <CTableRow>
          <CTableDataCell colSpan="3" className="text-center py-5">
            <div 
              className="d-flex flex-column align-items-center"
              style={{
                padding: '40px 20px',
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                borderRadius: '16px',
                margin: '20px',
                border: '2px dashed #dee2e6'
              }}
            >
              <div 
                className="mb-4 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                  borderRadius: '50%',
                  border: '3px solid #2196f3'
                }}
              >
                <CIcon icon={cilFolder} size="3xl" style={{ color: '#2196f3' }} />
              </div>
              <h5 className="mb-2" style={{ color: '#333', fontWeight: '600' }}>
                Chưa có danh mục nào
              </h5>
              <p className="text-muted mb-3" style={{ fontSize: '0.95rem'}}>
                Bấm nút "Thêm danh mục" để tạo danh mục đầu tiên cho hệ thống
              </p>
              <CButton
                color="primary"
                onClick={openCreateModal}
                style={{
                  borderRadius: '8px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(33, 150, 243, 0.3)',
                  fontWeight: '500'
                }}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Thêm danh mục đầu tiên
              </CButton>
            </div>
          </CTableDataCell>
        </CTableRow>
      )
    }

    const renderCategory = (category, level = 0) => {
      const hasChildren = category.children && category.children.length > 0
      const isExpanded = expandedCategories.has(category.id)
      
      return (
        <React.Fragment key={category.id}>
          <CTableRow 
            className="category-row"
            style={{
              backgroundColor: level === 0 ? '#fafafa' : 'transparent',
              borderRadius: '8px',
              margin: '4px 0',
              transition: 'all 0.3s ease'
            }}
          >
            <CTableDataCell className="py-3" style={{ width: '45%', verticalAlign: 'middle' }}>
              <div className="d-flex align-items-center position-relative" style={{ paddingLeft: `${level * 28}px` }}>
                {/* Tree line connector with gradient */}
                {level > 0 && (
                  <>
                    <div 
                      className="tree-connector-vertical"
                      style={{
                        position: 'absolute',
                        left: `${level * 28 - 16}px`,
                        top: '-20px',
                        width: '2px',
                        height: '40px',
                        background: `linear-gradient(to bottom, ${getTypeColor(category.type)}40, ${getTypeColor(category.type)}80)`,
                        borderRadius: '1px'
                      }}
                    />
                    <div 
                      className="tree-connector-horizontal"
                      style={{
                        position: 'absolute',
                        left: `${level * 28 - 16}px`,
                        top: '50%',
                        width: '16px',
                        height: '2px',
                        background: `linear-gradient(to right, ${getTypeColor(category.type)}80, ${getTypeColor(category.type)}40)`,
                        borderRadius: '1px',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  </>
                )}
                
                {/* Expand/Collapse Button with modern design */}
                {hasChildren && (
                  <CButton
                    color="ghost"
                    size="sm"
                    className="p-1 me-3 expand-btn"
                    onClick={() => toggleCategoryExpansion(category.id)}
                    style={{ 
                      minWidth: '32px', 
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isExpanded ? '#e3f2fd' : '#f8f9fa',
                      border: `2px solid ${isExpanded ? '#2196f3' : '#dee2e6'}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      boxShadow: isExpanded ? '0 2px 8px rgba(33, 150, 243, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <CIcon 
                      icon={cilCaretBottom} 
                      size="sm"
                      style={{ 
                        color: isExpanded ? '#1976d2' : '#666',
                        transition: 'color 0.3s ease'
                      }}
                    />
                  </CButton>
                )}
                {!hasChildren && (
                  <div style={{ width: '40px', marginRight: '12px' }}>
                    <div 
                      className="leaf-indicator"
                      style={{
                        width: '12px',
                        height: '12px',
                        background: `linear-gradient(135deg, ${getTypeColor(category.type)}, ${getTypeColor(category.type)}CC)`,
                        borderRadius: '50%',
                        marginLeft: '14px',
                        boxShadow: `0 2px 4px ${getTypeColor(category.type)}40`,
                        animation: 'pulse 2s infinite'
                      }}
                    />
                  </div>
                )}
                
                {/* Modern Card Container */}
                <div 
                  className="category-card d-flex align-items-center p-2 flex-grow-1"
                  style={{
                    backgroundColor: level === 0 ? '#ffffff' : '#fafafa',
                    border: `1px solid ${level === 0 ? '#e0e0e0' : '#f0f0f0'}`,
                    borderRadius: '10px',
                    borderLeft: `3px solid ${getTypeColor(category.type)}`,
                    boxShadow: level === 0 ? '0 2px 8px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = level === 0 ? '0 4px 16px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = level === 0 ? '0 2px 8px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* Folder Icon with gradient */}
                  <div 
                    className="folder-icon me-2"
                    style={{
                      width: '36px',
                      height: '36px',
                      background: hasChildren 
                        ? (isExpanded 
                            ? 'linear-gradient(135deg, #4caf50, #81c784)' 
                            : 'linear-gradient(135deg, #2196f3, #64b5f6)') 
                        : 'linear-gradient(135deg, #757575, #9e9e9e)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 2px 6px ${hasChildren ? (isExpanded ? '#4caf5040' : '#2196f340') : '#75757540'}`
                    }}
                  >
                    <CIcon 
                      icon={hasChildren ? (isExpanded ? cilFolderOpen : cilFolder) : cilFolder} 
                      size="md"
                      style={{ color: 'white' }}
                    />
                  </div>
                  
                  {/* Thumbnail with modern styling */}
                  <div 
                    className="thumbnail-container me-2"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '2px solid #fff',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
                      backgroundColor: '#f8f9fa',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={category.thumbnail || '/placeholder-category.jpg'}
                      alt={category.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      className="category-thumbnail"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                  
                  {/* Category Info with better typography */}
                  <div className="category-info flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <h6 
                        className="category-name me-2 mb-0"
                        style={{ 
                          fontSize: level === 0 ? '1rem' : '0.9rem',
                          color: level === 0 ? '#1976d2' : '#333',
                          fontWeight: level === 0 ? '600' : '500',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {category.name}
                      </h6>
                      {hasChildren && (
                        <span 
                          className="children-count"
                          style={{
                            background: `linear-gradient(135deg, ${getTypeColor(category.type)}, ${getTypeColor(category.type)}CC)`,
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '3px 6px',
                            borderRadius: '10px',
                            fontWeight: '600',
                            boxShadow: `0 2px 4px ${getTypeColor(category.type)}40`
                          }}
                        >
                          {category.children.length}
                        </span>
                      )}
                    </div>
                    {category.slug && (
                      <div className="d-flex align-items-center mb-1">
                        <span 
                          className="slug-badge"
                          style={{
                            backgroundColor: '#f5f5f5',
                            color: '#666',
                            fontSize: '0.75rem',
                            padding: '2px 5px',
                            borderRadius: '5px',
                            fontFamily: 'monospace'
                          }}
                        >
                          {category.slug}
                        </span>
                      </div>
                    )}
                    {category.description && (
                      <p 
                        className="description text-muted mb-0"
                        style={{ 
                          fontSize: '0.8rem',
                          lineHeight: '1.3',
                          maxWidth: '350px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CTableDataCell>
            
            {/* Type Column */}
            <CTableDataCell className="py-3" style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle' }}>
              {category.type && (
                <div className="d-flex justify-content-center">
                  <span 
                    className="type-badge"
                    style={{
                      background: `linear-gradient(135deg, ${getTypeColor(category.type)}, ${getTypeColor(category.type)}CC)`,
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '14px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      boxShadow: `0 2px 6px ${getTypeColor(category.type)}40`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {getTypeText(category.type)}
                  </span>
                </div>
              )}
            </CTableDataCell>
            
            {/* Actions Column */}
            <CTableDataCell className="py-3" style={{ width: '30%', textAlign: 'center', verticalAlign: 'middle' }}>
              <CDropdown>
                <CDropdownToggle 
                  color="ghost" 
                  caret={false}
                  className="action-toggle mx-auto"
                  style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f8f9fa',
                    display: 'block'
                  }}
                >
                  <CIcon icon={cilOptions} style={{ color: '#666', fontSize: '0.9rem' }} />
                </CDropdownToggle>
                <CDropdownMenu 
                  style={{
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    borderRadius: '12px',
                    padding: '8px 0'
                  }}
                >
                  <CDropdownItem 
                    onClick={() => openEditModal(category)}
                    className="d-flex align-items-center"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      margin: '0 6px',
                      transition: 'all 0.2s ease',
                      fontSize: '0.85rem'
                    }}
                  >
                    <CIcon icon={cilPencil} className="me-2" style={{ color: '#2196f3', fontSize: '0.8rem' }} />
                    <span style={{ fontWeight: '500' }}>Chỉnh sửa</span>
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={() => setDeleteModal({ visible: true, category })}
                    className="text-danger d-flex align-items-center"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      margin: '0 6px',
                      transition: 'all 0.2s ease',
                      fontSize: '0.85rem'
                    }}
                  >
                    <CIcon icon={cilTrash} className="me-2" style={{ fontSize: '0.8rem' }} />
                    <span style={{ fontWeight: '500' }}>Xóa</span>
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CTableDataCell>
          </CTableRow>
          {hasChildren && isExpanded && category.children.map(child => renderCategory(child, level + 1))}
        </React.Fragment>
      )
    }

    return categories.map(category => renderCategory(category, level))
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: modernCategoryStyles }} />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader 
              className="d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e0e0e0',
                borderRadius: '8px 8px 0 0',
                padding: '20px 24px'
              }}
            >
              <div>
                <h5 className="mb-1" style={{ color: '#333', fontWeight: '600', fontSize: '1.1rem' }}>
                  Quản lý danh mục
                </h5>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <CButton 
                  color="primary" 
                  size="sm"
                  onClick={toggleAllCategories}
                  title={expandedCategories.size > 0 ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                  style={{
                    borderRadius: '6px',
                    padding: '6px 10px',
                    background: expandedCategories.size > 0 
                      ? 'linear-gradient(135deg, #757575, #9e9e9e)' 
                      : 'linear-gradient(135deg, #2196f3, #64b5f6)',
                    border: 'none',
                    boxShadow: expandedCategories.size > 0 
                      ? '0 2px 6px rgba(117, 117, 117, 0.3)' 
                      : '0 2px 6px rgba(33, 150, 243, 0.3)',
                    fontWeight: '500',
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CIcon 
                    icon={expandedCategories.size > 0 ? cilCaretRight : cilCaretBottom} 
                    className="me-1" 
                    style={{ fontSize: '0.75rem' }} 
                  />
                  {expandedCategories.size > 0 ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                </CButton>
                <CButton 
                  color="success" 
                  onClick={openCreateModal}
                  style={{
                    borderRadius: '6px',
                    padding: '6px 10px',
                    background: 'linear-gradient(135deg, #4caf50, #81c784)',
                    border: 'none',
                    boxShadow: '0 2px 6px rgba(76, 175, 80, 0.3)',
                    fontWeight: '500',
                    fontSize: '0.8rem'
                  }}
                >
                  <CIcon icon={cilPlus} className="me-1" style={{ fontSize: '0.75rem' }} />
                  Thêm danh mục
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody style={{ minHeight: '400px' }}>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                  <div className="text-center">
                    <CSpinner 
                      color="primary" 
                      size="lg" 
                      style={{ 
                        width: '3rem', 
                        height: '3rem',
                        marginBottom: '1rem'
                      }} 
                    />
                    <p className="text-muted">Đang tải danh sách danh mục...</p>
                  </div>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow style={{ backgroundColor: '#f8f9fa' }}>
                      <CTableHeaderCell 
                        scope="col" 
                        style={{ 
                          fontWeight: '600',
                          color: '#333',
                          border: 'none',
                          padding: '12px 16px',
                          borderRadius: '8px 0 0 8px',
                          width: '45%',
                          fontSize: '0.9rem'
                        }}
                      >
                        Tên danh mục
                      </CTableHeaderCell>
                      <CTableHeaderCell 
                        scope="col"
                        style={{ 
                          fontWeight: '600',
                          color: '#333',
                          border: 'none',
                          padding: '12px 16px',
                          width: '25%',
                          textAlign: 'center',
                          fontSize: '0.9rem'
                        }}
                      >
                        Loại
                      </CTableHeaderCell>
                      <CTableHeaderCell 
                        scope="col"
                        style={{ 
                          fontWeight: '600',
                          color: '#333',
                          border: 'none',
                          padding: '12px 16px',
                          borderRadius: '0 8px 8px 0',
                          width: '30%',
                          textAlign: 'center',
                          fontSize: '0.9rem'
                        }}
                      >
                        Thao tác
                      </CTableHeaderCell>
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
            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="name">Tên danh mục *</CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  invalid={!!formErrors.name}
                  required
                />
                {formErrors.name && (
                  <CFormFeedback invalid>
                    {formErrors.name}
                  </CFormFeedback>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="type">Loại danh mục *</CFormLabel>
                <CFormSelect
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  invalid={!!formErrors.type}
                  required
                >
                  <option value="PRODUCT">Sản phẩm</option>
                  <option value="BLOG">Bài viết</option>
                </CFormSelect>
                {formErrors.type && (
                  <CFormFeedback invalid>
                    {formErrors.type}
                  </CFormFeedback>
                )}
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
                  {flattenCategories(categories)
                    .filter(cat => cat.id !== formModal.category?.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.displayName}
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={12}>
                <CFormLabel htmlFor="thumbnail">
                  Hình ảnh {!formModal.isEdit ? '*' : '(Tùy chọn)'}
                </CFormLabel>
                <CFormInput
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  invalid={!!formErrors.thumbnail}
                  required={!formModal.isEdit}
                />
                {formErrors.thumbnail && (
                  <CFormFeedback invalid>
                    {formErrors.thumbnail}
                  </CFormFeedback>
                )}
                
                {/* Preview for newly selected image */}
                {thumbnailFile && (
                  <div className="mt-3">
                    <small className="text-success d-block mb-2">Hình ảnh mới được chọn:</small>
                    <img
                      src={URL.createObjectURL(thumbnailFile)}
                      alt="Preview"
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '3px solid #28a745',
                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)'
                        e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)'
                        e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)'
                      }}
                    />
                  </div>
                )}
                
                {/* Display current image for edit mode */}
                {formModal.isEdit && (formModal.category?.thumbnail || formModal.category?.thumbnailUrl) && (
                  <div className="mt-3">
                    <small className="text-muted d-block mb-2">Hình ảnh hiện tại:</small>
                    <div className="d-flex align-items-center">
                      <img
                        src={formModal.category.thumbnail || formModal.category.thumbnailUrl}
                        alt={formModal.category.name}
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '3px solid #e9ecef',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'all 0.3s ease'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)'
                          e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)'
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      />
                      <div 
                        style={{ 
                          display: 'none',
                          width: '120px', 
                          height: '120px', 
                          backgroundColor: '#f8f9fa',
                          border: '3px dashed #dee2e6',
                          borderRadius: '12px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6c757d',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          padding: '10px',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>📷</div>
                        <div>Không thể tải hình ảnh</div>
                      </div>
                      <div className="ms-3">
                        <small className="text-muted d-block">
                          Chọn hình ảnh mới để thay thế hình ảnh hiện tại
                        </small>
                        <small className="text-info d-block mt-1">
                          Để trống nếu muốn giữ nguyên hình ảnh cũ
                        </small>
                      </div>
                    </div>
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
            <CButton 
              color="primary" 
              type="submit" 
              disabled={!isFormValid()}
            >
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
