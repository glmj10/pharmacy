import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CSpinner,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import { useAuth } from '../common/ProtectedRoute'
import { useLogout } from '../../hooks/useLogout'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import LogoutConfirmationModal from '../common/LogoutConfirmationModal'
import UserAvatar from '../common/UserAvatar'

const AppHeaderDropdown = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isLoggingOut } = useLogout()
  const { 
    userInfo, 
    loading, 
    displayName, 
    email, 
    profilePic, 
    hasProfilePic, 
    initials 
  } = useCurrentUser()

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleCloseModal = () => {
    setShowLogoutModal(false)
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <UserAvatar 
          userInfo={userInfo} 
          loading={loading} 
          size="md"
        />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold py-2">
          <div className="d-flex align-items-center">
            <div>
              <div className="fw-semibold">
                {loading ? 'Đang tải...' : displayName}
              </div>
              {email && !loading && (
                <small className="text-muted">{email}</small>
              )}
            </div>
          </div>
        </CDropdownHeader>        
        <CDropdownItem 
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilUser} className="me-2" />
          Hồ sơ
        </CDropdownItem>
      
      
        <CDropdownDivider />
        
        <CDropdownItem 
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
          style={{ cursor: isLoggingOut ? 'not-allowed' : 'pointer' }}
          className={isLoggingOut ? 'text-muted' : ''}
        >
          {isLoggingOut ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Đang đăng xuất...
            </>
          ) : (
            <>
              <CIcon icon={cilLockLocked} className="me-2" />
              Đăng xuất
            </>
          )}
        </CDropdownItem>
      </CDropdownMenu>

      {/* Modal xác nhận đăng xuất */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onClose={handleCloseModal}
      />
    </CDropdown>
  )
}

export default AppHeaderDropdown
