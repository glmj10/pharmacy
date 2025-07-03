/**
 * User Info Events Utility
 * Quản lý việc thông báo cập nhật thông tin user giữa các components
 */

// Event names
export const USER_INFO_EVENTS = {
  UPDATED: 'userInfoUpdated',
  CLEARED: 'userInfoCleared'
};

/**
 * Dispatch event khi user info được cập nhật
 */
export const dispatchUserInfoUpdated = (userInfo) => {
  const event = new CustomEvent(USER_INFO_EVENTS.UPDATED, {
    detail: { userInfo }
  });
  window.dispatchEvent(event);
};

/**
 * Dispatch event khi user info bị xóa (logout)
 */
export const dispatchUserInfoCleared = () => {
  const event = new CustomEvent(USER_INFO_EVENTS.CLEARED);
  window.dispatchEvent(event);
};

/**
 * Listen for user info updates
 */
export const addUserInfoUpdateListener = (callback) => {
  window.addEventListener(USER_INFO_EVENTS.UPDATED, callback);
  return () => window.removeEventListener(USER_INFO_EVENTS.UPDATED, callback);
};

/**
 * Listen for user info cleared
 */
export const addUserInfoClearListener = (callback) => {
  window.addEventListener(USER_INFO_EVENTS.CLEARED, callback);
  return () => window.removeEventListener(USER_INFO_EVENTS.CLEARED, callback);
};
