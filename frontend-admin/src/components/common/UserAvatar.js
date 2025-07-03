import React from 'react';
import { CAvatar, CSpinner } from '@coreui/react';

/**
 * Component Avatar tái sử dụng cho user với scale size linh hoạt
 */
const UserAvatar = ({ 
  userInfo, 
  loading = false, 
  size = 'md', 
  customSize = null, // Custom size in pixels
  showInitials = true,
  className = '',
  style = {},
  onClick
}) => {
  // Tạo initials từ tên hoặc email
  const getInitials = (name) => {
    if (!name) return 'U';
    
    const names = name.split(' ').filter(n => n.length > 0);
    if (names.length >= 2) {
      return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Lấy kích thước pixel dựa trên size hoặc customSize
  const getPixelSize = () => {
    if (customSize) return customSize;
    
    switch (size) {
      case 'xs': return 24;
      case 'sm': return 32;
      case 'md': return 40;
      case 'lg': return 56;
      case 'xl': return 72;
      case 'xxl': return 96;
      default: return 40;
    }
  };

  // Lấy font size cho initials dựa trên kích thước avatar
  const getFontSize = () => {
    const pixelSize = getPixelSize();
    return Math.max(Math.floor(pixelSize * 0.4), 10); // 40% của kích thước avatar, tối thiểu 10px
  };

  // Style tùy chỉnh cho avatar với kích thước cố định và hình tròn
  const getAvatarStyle = () => {
    const pixelSize = getPixelSize();
    return {
      width: `${pixelSize}px`,
      height: `${pixelSize}px`,
      minWidth: `${pixelSize}px`,
      minHeight: `${pixelSize}px`,
      maxWidth: `${pixelSize}px`,
      maxHeight: `${pixelSize}px`,
      borderRadius: '50%',
      objectFit: 'cover', // Đảm bảo ảnh không bị co giãn
      objectPosition: 'center',
      fontSize: `${getFontSize()}px`,
      cursor: onClick ? 'pointer' : 'default',
      overflow: 'hidden', // Ẩn phần ảnh thừa
      flexShrink: 0, // Không cho phép thu nhỏ
      ...style
    };
  };

  const displayName = userInfo?.username || userInfo?.email || 'User';
  const initials = getInitials(displayName);

  if (loading) {
    return (
      <CAvatar 
        size={customSize ? undefined : size}
        className={`bg-light d-flex align-items-center justify-content-center ${className}`}
        style={getAvatarStyle()}
        onClick={onClick}
      >
        <CSpinner size="sm" />
      </CAvatar>
    );
  }

  // Nếu có ảnh profile
  if (userInfo?.profilePic) {
    return (
      <div 
        className={`position-relative ${className}`}
        style={{
          ...getAvatarStyle(),
          background: '#f8f9fa' // Background color khi ảnh đang load
        }}
        onClick={onClick}
        title={displayName}
      >
        <img
          src={userInfo.profilePic}
          alt={displayName}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block'
          }}
          onError={(e) => {
            // Fallback khi ảnh lỗi
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div style="
                width: 100%; 
                height: 100%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                background: #6c757d; 
                color: white; 
                font-weight: bold;
                border-radius: 50%;
              ">
                ${initials}
              </div>
            `;
          }}
        />
      </div>
    );
  }

  // Hiển thị initials với hình tròn cố định
  if (showInitials) {
    return (
      <div 
        className={`d-flex align-items-center justify-content-center bg-primary text-white ${className}`}
        style={{
          ...getAvatarStyle(),
          fontWeight: 'bold',
          userSelect: 'none'
        }}
        onClick={onClick}
        title={displayName}
      >
        {initials}
      </div>
    );
  }

  // Fallback avatar mặc định với hình tròn cố định
  return (
    <div 
      className={`d-flex align-items-center justify-content-center bg-secondary ${className}`}
      style={{
        ...getAvatarStyle(),
        fontSize: `${getFontSize() * 1.2}px` // Emoji lớn hơn một chút
      }}
      onClick={onClick}
      title={displayName}
    >
      👤
    </div>
  );
};

export default UserAvatar;
