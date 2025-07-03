import React, { useState, useEffect } from 'react'
import {
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
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilOptions,
  cilInfo,
  cilCheckCircle,
  cilXCircle,
  cilClock,
} from '@coreui/icons'
import { contactService } from '../../../services'
import { useApiCall } from '../../../hooks/useApiCall'

const ContactList = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusModal, setStatusModal] = useState({ 
    visible: false, 
    contact: null, 
    newStatus: '' 
  })
  const [detailModal, setDetailModal] = useState({ visible: false, contact: null })
  
  const { execute: callApi } = useApiCall()

  const CONTACT_STATUSES = {
    PENDING: { label: 'Chờ xử lý', color: 'warning' },
    PROCESSING: { label: 'Đang xử lý', color: 'info' },
    RESOLVED: { label: 'Đã giải quyết', color: 'success' },
    CLOSED: { label: 'Đã đóng', color: 'secondary' },
  }

  const fetchContacts = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = {
        pageIndex: page - 1, // API uses 0-based indexing
        pageSize: 10,
        ...(search && { search }),
      }
      
      const response = await callApi(() => contactService.getContacts(params))
      console.log('Contacts response:', response)
      if (response.success) {
        // Handle both array and paginated response formats
        const contactsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || response.data.data || []
        setContacts(contactsData)
        setTotalPages(response.data.totalPages || 1)
        setCurrentPage(page)
      } else {
        setContacts([])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchContacts(1, searchTerm)
  }

  const handlePageChange = (page) => {
    fetchContacts(page, searchTerm)
  }

  const handleStatusChange = async () => {
    if (!statusModal.contact || !statusModal.newStatus) return

    try {
      const response = await callApi(() => 
        contactService.updateContactStatus(statusModal.contact.id, statusModal.newStatus)
      )
      
      if (response.success) {
        setStatusModal({ visible: false, contact: null, newStatus: '' })
        fetchContacts(currentPage, searchTerm)
      }
    } catch (error) {
      console.error('Error updating contact status:', error)
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

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Quản lý liên hệ</strong>
            </CCardHeader>
            <CCardBody>
              {/* Search */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <form onSubmit={handleSearch}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Tìm kiếm liên hệ..."
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
                        <CTableHeaderCell scope="col">Thông tin liên hệ</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Chủ đề</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Nội dung</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Trạng thái</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Ngày tạo</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {Array.isArray(contacts) && contacts.map((contact) => (
                        <CTableRow key={contact.id}>
                          <CTableDataCell>
                            <div>
                              <strong>{contact.name}</strong>
                              <br />
                              <small className="text-muted">{contact.email}</small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <strong>{contact.subject}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div style={{ maxWidth: '200px' }}>
                              {contact.message && contact.message.length > 100 
                                ? `${contact.message.substring(0, 100)}...` 
                                : contact.message
                              }
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={CONTACT_STATUSES[contact.status]?.color || 'secondary'}>
                              {CONTACT_STATUSES[contact.status]?.label || contact.status}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>{formatDate(contact.createdAt)}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CDropdown>
                              <CDropdownToggle color="ghost" caret={false}>
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem
                                  onClick={() => setDetailModal({ visible: true, contact })}
                                >
                                  <CIcon icon={cilInfo} className="me-2" />
                                  Chi tiết
                                </CDropdownItem>
                                <CDropdownItem
                                  onClick={() => setStatusModal({
                                    visible: true,
                                    contact,
                                    newStatus: contact.status
                                  })}
                                >
                                  <CIcon icon={cilCheckCircle} className="me-2" />
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
        onClose={() => setStatusModal({ visible: false, contact: null, newStatus: '' })}
      >
        <CModalHeader>
          <CModalTitle>Cập nhật trạng thái liên hệ</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Liên hệ từ: <strong>{statusModal.contact?.name}</strong></p>
          <p>Email: <strong>{statusModal.contact?.email}</strong></p>
          <p>Chủ đề: <strong>{statusModal.contact?.subject}</strong></p>
          <CFormSelect
            value={statusModal.newStatus}
            onChange={(e) => setStatusModal(prev => ({ ...prev, newStatus: e.target.value }))}
          >
            {Object.entries(CONTACT_STATUSES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </CFormSelect>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setStatusModal({ visible: false, contact: null, newStatus: '' })}
          >
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleStatusChange}>
            Cập nhật
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Contact Detail Modal */}
      <CModal
        size="lg"
        visible={detailModal.visible}
        onClose={() => setDetailModal({ visible: false, contact: null })}
      >
        <CModalHeader>
          <CModalTitle>Chi tiết liên hệ</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {detailModal.contact && (
            <>
              <CRow className="mb-3">
                <CCol md={6}>
                  <strong>Tên:</strong> {detailModal.contact.name}
                </CCol>
                <CCol md={6}>
                  <strong>Email:</strong> {detailModal.contact.email}
                </CCol>
              </CRow>
              
              <CRow className="mb-3">
                <CCol md={6}>
                  <strong>Chủ đề:</strong> {detailModal.contact.subject}
                </CCol>
                <CCol md={6}>
                  <strong>Trạng thái:</strong>{' '}
                  <CBadge color={CONTACT_STATUSES[detailModal.contact.status]?.color || 'secondary'}>
                    {CONTACT_STATUSES[detailModal.contact.status]?.label || detailModal.contact.status}
                  </CBadge>
                </CCol>
              </CRow>
              
              <CRow className="mb-3">
                <CCol md={12}>
                  <strong>Nội dung:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {detailModal.contact.message}
                  </div>
                </CCol>
              </CRow>
              
              <CRow className="mb-3">
                <CCol md={12}>
                  <strong>Ngày tạo:</strong> {formatDate(detailModal.contact.createdAt)}
                </CCol>
              </CRow>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setDetailModal({ visible: false, contact: null })}
          >
            Đóng
          </CButton>
          <CButton 
            color="primary"
            onClick={() => {
              setDetailModal({ visible: false, contact: null })
              setStatusModal({
                visible: true,
                contact: detailModal.contact,
                newStatus: detailModal.contact?.status || 'PENDING'
              })
            }}
          >
            Cập nhật trạng thái
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ContactList
