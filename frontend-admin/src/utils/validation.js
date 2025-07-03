export const validateField = (value, rules) => {
  if (!rules) return null;

  if (rules.required && (!value || value.toString().trim() === '')) {
    return rules.required;
  }

  if (value && rules.minLength && value.toString().length < rules.minLength.value) {
    return rules.minLength.message;
  }

  if (value && rules.maxLength && value.toString().length > rules.maxLength.value) {
    return rules.maxLength.message;
  }

  if (value && rules.pattern && !rules.pattern.value.test(value)) {
    return rules.pattern.message;
  }

  if (value && rules.min && parseFloat(value) < rules.min.value) {
    return rules.min.message;
  }

  return null;
};

export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach(field => {
    const error = validateField(formData[field], validationSchema[field]);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { errors, isValid };
};

export const parseBackendErrors = (error) => {
  if (error.response?.data?.errors) {
    return error.response.data.errors;
  }
  
  if (error.response?.data?.message) {
    return { general: error.response.data.message };
  }
  
  return { general: "Đã có lỗi xảy ra. Vui lòng thử lại." };
};


export const validationSchemas = {
  login: {
    email: {
      required: "Email là bắt buộc",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Email không hợp lệ"
      }
    },
    password: {
      required: "Mật khẩu là bắt buộc",
      minLength: {
        value: 6,
        message: "Mật khẩu phải có ít nhất 6 ký tự"
      }
    }
  }
};