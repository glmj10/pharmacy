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
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ visible: false, blog: null })
  
  const { execute: callApi } = useApiCall()

  const fetchBlogs = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = {
        pageIndex: page - 1, // API uses 0-based indexing
        pageSize: 10,
        ...(search && { search }),
      }
      
      const response = await callApi(() => blogService.getBlogs(params))
      if (response.success) {
        // Handle both array and paginated response formats
        const blogsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || response.data.data || []
        setBlogs(blogsData)
        setTotalPages(response.data.totalPages || 1)
        setCurrentPage(page)
        console.log('Blogs loaded:', blogsData) // Debug log
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
    fetchBlogs(1, searchTerm)
  }

  const handlePageChange = (page) => {
    fetchBlogs(page, searchTerm)
  }

  const handleStatusToggle = async (blogId, currentStatus) => {
    try {
      const response = await callApi(() => 
        blogService.updateBlogStatus(blogId, !currentStatus)
      )
      if (response.success) {
        fetchBlogs(currentPage, searchTerm)
      }
    } catch (error) {
      console.error('Error updating blog status:', error)
    }
  }

  const handleDeleteBlog = async () => {
    if (!deleteModal.blog) return

    try {
      const response = await callApi(() => 
        blogService.deleteBlog(deleteModal.blog.id)
      )
      if (response.success) {
        setDeleteModal({ visible: false, blog: null })
        fetchBlogs(currentPage, searchTerm)
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
                href="#/blogs/create"
              >
                <CIcon icon={cilPlus} className="me-1" />
                Thêm bài viết
              </CButton>
            </CCardHeader>
            <CCardBody>
              {/* Search */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <form onSubmit={handleSearch}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Tìm kiếm bài viết..."
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
                <div className="text-center py-4">
                  <CSpinner color="primary" />
                </div>
              ) : (
                <>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Hình ảnh</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tiêu đề</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Nội dung</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Trạng thái</CTableHeaderCell>
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
                            <div style={{ maxWidth: '200px' }}>
                              {truncateContent(blog.content)}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getBadgeColor(blog.active)}>
                              {getStatusText(blog.active)}
                            </CBadge>
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
                                <CDropdownItem href={`#/blogs/edit/${blog.id}`}>
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Chỉnh sửa
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => handleStatusToggle(blog.id, blog.active)}
                                >
                                  <CIcon 
                                    icon={blog.active ? cilToggleOff : cilToggleOn} 
                                    className="me-2" 
                                  />
                                  {blog.active ? 'Chuyển về nháp' : 'Xuất bản'}
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
    </>
  )
}

export default BlogList
