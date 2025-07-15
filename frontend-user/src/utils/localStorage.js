/**
 * Safe localStorage utilities
 */

export const localStorageUtils = {
  /**
   * Safely get item from localStorage
   * @param {string} key 
   * @returns {string|null}
   */
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

  /**
   * Safely set item to localStorage
   * @param {string} key 
   * @param {string} value 
   * @returns {boolean} success
   */
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

  /**
   * Safely remove item from localStorage
   * @param {string} key 
   * @returns {boolean} success
   */
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

  /**
   * Safely get JSON from localStorage
   * @param {string} key 
   * @returns {any|null}
   */
  getJSON: (key) => {
    try {
      const item = localStorageUtils.getItem(key);
      if (!item) return null;
      
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing JSON from localStorage item ${key}:`, error);
      // Remove corrupted data
      localStorageUtils.removeItem(key);
      return null;
    }
  },

  /**
   * Safely set JSON to localStorage
   * @param {string} key 
   * @param {any} value 
   * @returns {boolean} success
   */
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

  /**
   * Clear all localStorage data
   */
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

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
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
