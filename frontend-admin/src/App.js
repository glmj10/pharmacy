import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'

// Notification Provider
import { NotificationProvider } from './contexts/NotificationContext'

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute'

// Global Logout Handler
import { globalLogoutHandler } from './utils/globalLogout'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const Page401 = React.lazy(() => import('./views/pages/error/page401'))
const Page403 = React.lazy(() => import('./views/pages/error/page403'))
const ForgotPassword = React.lazy(() => import('./views/pages/forgotPassword/forgotPassword'))
const ResetPassword = React.lazy(() => import('./views/pages/resetPassword/resetPassword'))

const AppRouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Register logout callback
    const unregister = globalLogoutHandler.registerCallback((reason) => {
      console.log('Logout triggered:', reason);
      // Navigate to login page
      navigate('/login', { replace: true });
    });

    return unregister;
  }, [navigate]);

  return (
    <Routes>
      <Route exact path="/login" name="Login Page" element={<Login />} />
      <Route exact path="/register" name="Register Page" element={<Register />} />
      <Route exact path="/forgot-password" name="Forgot Password" element={<ForgotPassword />} />
      <Route exact path="/reset-password" name="Reset Password" element={<ResetPassword />} />
      <Route exact path="/404" name="Page 404" element={<Page404 />} />
      <Route exact path="/500" name="Page 500" element={<Page500 />} />
      <Route exact path="/401" name="Page 401" element={<Page401 />} />
      <Route exact path="/403" name="Page 403" element={<Page403 />} />
      <Route 
        path="*" 
        name="Home" 
        element={
          <ProtectedRoute requiredRoles={['ADMIN', 'STAFF']}>
            <DefaultLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NotificationProvider>
      <BrowserRouter basename="/admin">
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <AppRouter />
        </Suspense>
      </BrowserRouter>
    </NotificationProvider>
  )
}

export default App
