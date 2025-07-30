import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { apiUtils } from '../utils/apiUtils';

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useNotification();

  const execute = async (
    apiCall, 
    options = {}
  ) => {
    const {
      successMessage = null,
      errorMessage = null,
      showSuccessNotification = false,
      showErrorNotification = true,
      onSuccess = null,
      onError = null,
      validateResponse = true
    } = options;

    setLoading(true);

    try {
      const response = await apiCall();

      if (validateResponse && response && !response.isSuccess()) {
        const errorMsg = errorMessage || response.message || 'Thao tác thất bại';
        if (showErrorNotification) {
          showError(errorMsg);
        }
        if (onError) {
          onError(response);
        }
        return { success: false, data: null, error: response };
      }

      if (showSuccessNotification && successMessage) {
        showSuccess(successMessage);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return { 
        success: true, 
        data: response?.data || response, 
        error: null 
      };

    } catch (error) {
      console.error('API call error:', error);

      const errorMsg = errorMessage || apiUtils.getUserFriendlyErrorMessage(error);
      
      if (showErrorNotification) {
        showError(errorMsg);
      }

      if (onError) {
        onError(error);
      }

      return { success: false, data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
};

export const useFormSubmit = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { showSuccess, showError } = useNotification();

  const submit = async (
    submitFunction,
    options = {}
  ) => {
    const {
      successMessage = null,
      onSuccess = null,
      onError = null,
      clearErrorsOnSubmit = true
    } = options;

    setLoading(true);
    
    if (clearErrorsOnSubmit) {
      setValidationErrors({});
    }

    try {
      const response = await submitFunction();

      if (response && response.isSuccess && !response.isSuccess()) {
        showError(response.message || 'Thao tác thất bại');
        if (onError) {
          onError(response);
        }
        return { success: false, data: null };
      }

      if (successMessage) {
        showSuccess(successMessage);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return { 
        success: true, 
        data: response?.data || response 
      };

    } catch (error) {
      console.error('Form submit error:', error);

      const fieldErrors = apiUtils.extractValidationErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setValidationErrors(fieldErrors);
      }

      const errorMessage = apiUtils.getUserFriendlyErrorMessage(error);
      showError(errorMessage);

      if (onError) {
        onError(error);
      }

      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  const clearValidationError = (fieldName) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: undefined
    }));
  };

  const clearAllValidationErrors = () => {
    setValidationErrors({});
  };

  return {
    submit,
    loading,
    validationErrors,
    clearValidationError,
    clearAllValidationErrors
  };
};
