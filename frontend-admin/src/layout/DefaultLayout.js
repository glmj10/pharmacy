import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import GlobalToaster from '../components/GlobalToaster'
import LogoutModal from '../components/LogoutModal'
import { globalLogoutHandler } from '../utils/globalLogout'

const DefaultLayout = () => {
  const navigate = useNavigate()
  const [logoutModal, setLogoutModal] = useState({
    visible: false,
    reason: '',
    message: ''
  })

  useEffect(() => {
    // Register modal callback
    const unregisterModal = globalLogoutHandler.registerModalCallback((reason, message) => {
      setLogoutModal({
        visible: true,
        reason,
        message
      })
    })

    // Register logout callback
    const unregisterLogout = globalLogoutHandler.registerCallback((reason) => {
      navigate('/admin/login')
    })

    return () => {
      unregisterModal()
      unregisterLogout()
    }
  }, [navigate])

  const handleLogoutConfirm = () => {
    setLogoutModal({ visible: false, reason: '', message: '' })
    globalLogoutHandler.performLogout(logoutModal.reason)
  }

  const handleLogoutClose = () => {
    // Don't allow closing without confirming
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
      <GlobalToaster />
      <LogoutModal
        visible={logoutModal.visible}
        reason={logoutModal.reason}
        message={logoutModal.message}
        onClose={handleLogoutClose}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  )
}

export default DefaultLayout
