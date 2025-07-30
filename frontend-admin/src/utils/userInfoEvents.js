
export const USER_INFO_EVENTS = {
  UPDATED: 'userInfoUpdated',
  CLEARED: 'userInfoCleared'
};

export const dispatchUserInfoUpdated = (userInfo) => {
  const event = new CustomEvent(USER_INFO_EVENTS.UPDATED, {
    detail: { userInfo }
  });
  window.dispatchEvent(event);
};

export const dispatchUserInfoCleared = () => {
  const event = new CustomEvent(USER_INFO_EVENTS.CLEARED);
  window.dispatchEvent(event);
};

export const addUserInfoUpdateListener = (callback) => {
  window.addEventListener(USER_INFO_EVENTS.UPDATED, callback);
  return () => window.removeEventListener(USER_INFO_EVENTS.UPDATED, callback);
};

export const addUserInfoClearListener = (callback) => {
  window.addEventListener(USER_INFO_EVENTS.CLEARED, callback);
  return () => window.removeEventListener(USER_INFO_EVENTS.CLEARED, callback);
};
