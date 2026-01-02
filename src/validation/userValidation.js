export const validateRegisterUser = (data) => {
  const errors = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters long';
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Invalid email format';
    }
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required';
  } else {
    if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(data.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(data.password)) {
      errors.password = 'Password must contain at least one number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginUser = (data) => {
  const errors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
