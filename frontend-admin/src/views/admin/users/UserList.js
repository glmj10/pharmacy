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
  CFormSelect,
  CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilOptions,
  cilPencil,
  cilLockLocked,
  cilLockUnlocked,
  cilUser,
} from '@coreui/icons'
import { userService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusModal, setStatusModal] = useState({ 
    visible: false, 
    user: null, 
    newStatus: '' 
  })
  
  const { execute: callApi } = useApiCall()


  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = {
        pageIndex: page, // API uses 0-based indexing
        pageSize: 10,
        ...(search && { search }),
      }
      
      const response = await callApi(() => userService.getUsers(params))
      if (response.success) {
        // Handle both array and paginated response formats
        const usersData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || response.data.data || []
        setUsers(usersData)
        setTotalPages(response.data.totalPages || 1)
        setCurrentPage(page)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers(1, searchTerm)
  }

  const handlePageChange = (page) => {
    fetchUsers(page, searchTerm)
  }

  const handleStatusChange = async () => {
    if (!statusModal.user || !statusModal.newStatus) return

    try {
      const response = await callApi(() => 
        userService.updateUserStatus(statusModal.user.id, statusModal.newStatus)
      )
      
      if (response.success) {
        setStatusModal({ visible: false, user: null, newStatus: '' })
        fetchUsers(currentPage, searchTerm)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getRolesBadge = (roles) => {    
    // Kiểm tra nếu roles không tồn tại
    if (!roles) {
      console.log('Roles is undefined/null');
      return <CBadge color="secondary">No roles</CBadge>;
    }
    
    // Nếu roles là string (trường hợp role đơn)
    if (typeof roles === 'string') {
      return (
        <CBadge 
          color={roles === 'ADMIN' ? 'danger' : roles === 'USER' ? 'info' : roles === 'STAFF' ? 'warning' : 'secondary'}
          className="me-1"
        >
          {roles}
        </CBadge>
      );
    }
    
    // Nếu roles không phải array
    if (!Array.isArray(roles)) {
      console.log('Roles is not an array:', typeof roles, roles);
      return <CBadge color="secondary">Invalid roles</CBadge>;
    }
    
    // Nếu array rỗng
    if (roles.length === 0) {
      return <CBadge color="secondary">No roles</CBadge>;
    }
    
    return roles.map((role, index) => {
      // Xử lý trường hợp role là object có thuộc tính code
      const roleName = typeof role === 'object' && role.code ? role.code : 
                      typeof role === 'object' && role.name ? role.name : role;
      
      return (
        <CBadge 
          key={index} 
          color={roleName === 'ADMIN' ? 'danger' : roleName === 'USER' ? 'info' : roleName === 'STAFF' ? 'warning' : 'secondary'}
          className="me-1"
        >
          {roleName}
        </CBadge>
      );
    });
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Quản lý người dùng</strong>
            </CCardHeader>
            <CCardBody>
              {/* Search */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <form onSubmit={handleSearch}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Tìm kiếm người dùng..."
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
                        <CTableHeaderCell scope="col">Người dùng</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Vai trò</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Ngày tạo</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Array.isArray(users) && users.map((user) => (
                        <CTableRow key={user.id}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CAvatar
                                src={user.profilePic || '/default-avatar.jpg'}
                                size="md"
                                className="me-3"
                              />
                              <div>
                                <strong>{user.username}</strong>
                                <br />
                                <small className="text-muted">ID: {user.id}</small>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            {user.email}
                          </CTableDataCell>
                          <CTableDataCell>
                            {getRolesBadge(user.roles)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>{formatDate(user.createdAt)}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CDropdown>
                              <CDropdownToggle color="ghost" caret={false}>
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem href={`#/users/edit/${user.id}`}>
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Chỉnh sửa
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => setStatusModal({
                                    visible: true,
                                    user,
                                    newStatus: user.status
                                  })}
                                >
                                  <CIcon 
                                    icon={user.status === 'ACTIVE' ? cilLockLocked : cilLockUnlocked} 
                                    className="me-2" 
                                  />
                                  Cập nhật trạng thái
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

      {/* Status Update Modal */}
      <CModal
        visible={statusModal.visible}
        onClose={() => setStatusModal({ visible: false, user: null, newStatus: '' })}
      >
        <CModalHeader>
          <CModalTitle>Cập nhật trạng thái người dùng</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Người dùng: <strong>{statusModal.user?.username}</strong></p>
          <p>Email: <strong>{statusModal.user?.email}</strong></p>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setStatusModal({ visible: false, user: null, newStatus: '' })}
          >
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleStatusChange}>
            Cập nhật
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UserList
