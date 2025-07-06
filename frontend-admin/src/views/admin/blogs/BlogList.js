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
  cilDescription,
} from '@coreui/icons'
import { blogService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const BlogList = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ visible: false, blog: null })
  const [detailModal, setDetailModal] = useState({ visible: false, blog: null })
  
  const { execute: callApi } = useApiCall()

  const fetchBlogs = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = {
        pageIndex: page, // Backend expects 1-based indexing
        pageSize: 10,
        ...(search.trim() && { title: search.trim() }),
      }
      
      const response = await callApi(() => blogService.getBlogs(params))
      if (response.success) {
        const pageData = response.data
        const blogsData = pageData.content || []
        setBlogs(blogsData)
        setTotalPages(pageData.totalPages || 1)
        setCurrentPage(page)
      } else {
        setBlogs([])
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchBlogs(1, searchTerm.trim())
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
    fetchBlogs(1, '')
  }

  // Real-time search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchBlogs(1, searchTerm.trim())
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handlePageChange = (page) => {
    fetchBlogs(page, searchTerm.trim())
  }

  const handleDeleteBlog = async () => {
    if (!deleteModal.blog) return

    try {
      const response = await callApi(() => 
        blogService.deleteBlog(deleteModal.blog.id)
      )
      if (response.success) {
        setDeleteModal({ visible: false, blog: null })
        fetchBlogs(currentPage, searchTerm.trim())
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getBadgeColor = (status) => {
    return status ? 'success' : 'danger'
  }

  const getStatusText = (status) => {
    return status ? 'Đã xuất bản' : 'Bản nháp'
  }

  const truncateContent = (content, maxLength = 100) => {
    // Remove HTML tags and truncate
    const text = content.replace(/<[^>]*>/g, '')
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Quản lý bài viết</strong>
              <CButton 
                color="primary" 
                onClick={() => navigate('/blogs/create')}
              >
                <CIcon icon={cilPlus} className="me-1" />
                Thêm bài viết
              </CButton>
            </CCardHeader>
            <CCardBody>
              {/* Search */}
              <CRow className="mb-3">
                <CCol md={8}>
                  <form onSubmit={handleSearch}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Tìm kiếm bài viết theo tiêu đề..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <CInputGroupText>
                        <CButton type="submit" color="primary" variant="ghost">
                          <CIcon icon={cilSearch} />
                        </CButton>
                      </CInputGroupText>
                      {searchTerm && (
                        <CInputGroupText>
                          <CButton 
                            type="button" 
                            color="secondary" 
                            variant="ghost"
                            onClick={handleClearSearch}
                          >
                            ×
                          </CButton>
                        </CInputGroupText>
                      )}
                    </CInputGroup>
                  </form>
                </CCol>
                <CCol md={4} className="text-end">
                  {searchTerm.trim() && (
                    <small className="text-muted">
                      Kết quả tìm kiếm cho: <strong>"{searchTerm.trim()}"</strong>
                    </small>
                  )}
                </CCol>
              </CRow>

              {/* Table */}
              {loading ? (
                <div className="text-center py-4">
                  <CSpinner color="primary" />
                </div>
              ) : Array.isArray(blogs) && blogs.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <CIcon icon={cilSearch} size="3xl" className="text-muted" />
                  </div>
                  <h5 className="text-muted">
                    {searchTerm.trim() ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào'}
                  </h5>
                  <p className="text-muted">
                    {searchTerm.trim() 
                      ? `Không có bài viết nào khớp với "${searchTerm.trim()}"` 
                      : 'Hãy thêm bài viết đầu tiên của bạn'
                    }
                  </p>
                  {searchTerm.trim() ? (
                    <CButton color="secondary" onClick={handleClearSearch}>
                      Xóa tìm kiếm
                    </CButton>
                  ) : (
                    <CButton color="primary" onClick={() => navigate('/blogs/create')}>
                      <CIcon icon={cilPlus} className="me-1" />
                      Thêm bài viết đầu tiên
                    </CButton>
                  )}
                </div>
              ) : (
                <>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Hình ảnh</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tiêu đề</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Ngày tạo</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Array.isArray(blogs) && blogs.map((blog) => (
                        <CTableRow key={blog.id}>
                          <CTableDataCell>
                            <img
                              src={blog.thumbnail || '/placeholder-image.jpg'}
                              alt={blog.title}
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <div>
                              <strong>{blog.title}</strong>
                              <br />
                              <small className="text-muted">{blog.slug}</small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>{formatDate(blog.createdAt)}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CDropdown>
                              <CDropdownToggle color="ghost" caret={false}>
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem 
                                  onClick={() => setDetailModal({ visible: true, blog })}
                                >
                                  <CIcon icon={cilDescription} className="me-2" />
                                  Xem chi tiết
                                </CDropdownItem>
                                <CDropdownItem 
                                  onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                                >
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Chỉnh sửa
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => setDeleteModal({ visible: true, blog })}
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
                  {totalPages > 1 && (
                    <CPagination align="center" className="mt-3">
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Trước
                      </CPaginationItem>
                      {[...Array(totalPages)].map((_, index) => (
                        <CPaginationItem
                          key={index}
                          active={currentPage === index + 1}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Sau
                      </CPaginationItem>
                    </CPagination>
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
        onClose={() => setDeleteModal({ visible: false, blog: null })}
      >
        <CModalHeader>
          <CModalTitle>Xác nhận xóa</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Bạn có chắc chắn muốn xóa bài viết "{deleteModal.blog?.title}"?
          <br />
          <small className="text-danger">Hành động này không thể hoàn tác.</small>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setDeleteModal({ visible: false, blog: null })}
          >
            Hủy
          </CButton>
          <CButton color="danger" onClick={handleDeleteBlog}>
            Xóa
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Blog Detail Modal */}
      <CModal
        size="xl"
        visible={detailModal.visible}
        onClose={() => setDetailModal({ visible: false, blog: null })}
        scrollable
      >
        <CModalHeader>
          <CModalTitle>Chi tiết bài viết</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {detailModal.blog && (
            <div>
              {/* Blog Header */}
              <div className="mb-4">
                <h2 className="mb-3">{detailModal.blog.title}</h2>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <CBadge color={getBadgeColor(detailModal.blog.published)}>
                    {getStatusText(detailModal.blog.published)}
                  </CBadge>
                  <small className="text-muted">
                    Ngày tạo: {formatDate(detailModal.blog.createdAt)}
                  </small>
                  {detailModal.blog.updatedAt && (
                    <small className="text-muted">
                      Cập nhật: {formatDate(detailModal.blog.updatedAt)}
                    </small>
                  )}
                </div>
                <div className="mb-3">
                  <small className="text-muted">Slug: </small>
                  <code>{detailModal.blog.slug}</code>
                </div>
              </div>

              {/* Blog Thumbnail */}
              {detailModal.blog.thumbnail && (
                <div className="mb-4">
                  <h6>Hình ảnh đại diện</h6>
                  <img
                    src={detailModal.blog.thumbnail}
                    alt={detailModal.blog.title}
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              )}

              {/* Blog Summary */}
              {detailModal.blog.summary && (
                <div className="mb-4">
                  <h6>Tóm tắt</h6>
                  <p className="text-muted">{detailModal.blog.summary}</p>
                </div>
              )}

              {/* Blog Content */}
              <div className="mb-4">
                <h6>Nội dung</h6>
                <div 
                  style={{ 
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    minHeight: '200px'
                  }}
                  dangerouslySetInnerHTML={{ __html: detailModal.blog.content }}
                />
              </div>

              {/* Blog Category */}
              {detailModal.blog.category && (
                <div className="mb-4">
                  <h6>Danh mục</h6>
                  <CBadge color="info">{detailModal.blog.category.name}</CBadge>
                </div>
              )}

              {/* Blog Tags */}
              {detailModal.blog.tags && detailModal.blog.tags.length > 0 && (
                <div className="mb-4">
                  <h6>Thẻ tag</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {detailModal.blog.tags.map((tag, index) => (
                      <CBadge key={index} color="secondary">{tag}</CBadge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setDetailModal({ visible: false, blog: null })}
          >
            Đóng
          </CButton>
          <CButton 
            color="primary" 
            onClick={() => navigate(`/blogs/edit/${detailModal.blog?.id}`)}
          >
            <CIcon icon={cilPencil} className="me-1" />
            Chỉnh sửa
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default BlogList
