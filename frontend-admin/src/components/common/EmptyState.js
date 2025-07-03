import React from 'react'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilReload } from '@coreui/icons'

/**
 * Reusable empty state component
 */
const EmptyState = ({ 
  title = 'Không có dữ liệu',
  description = 'Chưa có dữ liệu để hiển thị',
  icon = null,
  action = null,
  className = ''
}) => {
  return (
    <div className={`d-flex flex-column justify-content-center align-items-center py-5 ${className}`}>
      {icon && (
        <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>
          <CIcon icon={icon} />
        </div>
      )}
      
      <h5 className="text-muted mb-2">{title}</h5>
      
      {description && (
        <p className="text-muted text-center mb-3" style={{ maxWidth: '300px' }}>
          {description}
        </p>
      )}
      
      {action && action}
    </div>
  )
}

/**
 * Product specific empty state
 */
export const ProductEmptyState = ({ onCreateNew, onRefresh, isSearching = false }) => {
  if (isSearching) {
    return (
      <EmptyState
        title="Không tìm thấy sản phẩm"
        description="Không có sản phẩm nào phù hợp với từ khóa tìm kiếm. Hãy thử tìm kiếm với từ khóa khác."
        action={
          onRefresh && (
            <CButton color="light" onClick={onRefresh}>
              <CIcon icon={cilReload} className="me-1" />
              Làm mới
            </CButton>
          )
        }
      />
    )
  }

  return (
    <EmptyState
      title="Chưa có sản phẩm nào"
      description="Hệ thống chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên để bắt đầu."
      action={
        <div className="d-flex gap-2">
          {onRefresh && (
            <CButton color="light" onClick={onRefresh}>
              <CIcon icon={cilReload} className="me-1" />
              Làm mới
            </CButton>
          )}
          {onCreateNew && (
            <CButton color="primary" onClick={onCreateNew}>
              <CIcon icon={cilPlus} className="me-1" />
              Thêm sản phẩm đầu tiên
            </CButton>
          )}
        </div>
      }
    />
  )
}

export default EmptyState
