import React from 'react'
import { CSpinner } from '@coreui/react'

/**
 * Reusable loading component
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = 'Đang tải...', 
  fullScreen = false,
  inline = false,
  className = '' 
}) => {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : undefined

  if (fullScreen) {
    return (
      <div 
        className="d-flex flex-column justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75"
        style={{ zIndex: 9999 }}
      >
        <CSpinner color={color} size={spinnerSize} />
        {text && <div className="mt-2 text-muted">{text}</div>}
      </div>
    )
  }

  if (inline) {
    return (
      <span className={`d-inline-flex align-items-center ${className}`}>
        <CSpinner color={color} size={spinnerSize} className="me-2" />
        {text && <span>{text}</span>}
      </span>
    )
  }

  return (
    <div className={`d-flex flex-column justify-content-center align-items-center py-4 ${className}`}>
      <CSpinner color={color} size={spinnerSize} />
      {text && <div className="mt-2 text-muted">{text}</div>}
    </div>
  )
}

export default LoadingSpinner
