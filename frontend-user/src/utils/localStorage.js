export const localStorageUtils = {
  getItem: (key) => {
    try {
      if (typeof window === 'undefined') return null;
      const item = localStorage.getItem(key);
      // Check for invalid values
      if (item === null || item === 'undefined' || item === 'null') {
        return null;
      }
      return item;
    } catch (error) {
      console.error(`Error getting localStorage item ${key}:`, error);
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined') return false;
      if (value === undefined || value === null) {
        localStorage.removeItem(key);
        return true;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
      return false;
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage item ${key}:`, error);
      return false;
    }
  },

  getJSON: (key) => {
    try {
      const item = localStorageUtils.getItem(key);
      if (!item) return null;
      
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing JSON from localStorage item ${key}:`, error);
      localStorageUtils.removeItem(key);
      return null;
    }
  },

  setJSON: (key, value) => {
    try {
      if (value === undefined || value === null) {
        return localStorageUtils.removeItem(key);
      }
      const jsonString = JSON.stringify(value);
      return localStorageUtils.setItem(key, jsonString);
    } catch (error) {
      console.error(`Error setting JSON to localStorage item ${key}:`, error);
      return false;
    }
  },

  clear: () => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  isAvailable: () => {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default localStorageUtils;
