// src/utils/validation.ts (Alternative - With Strong Password Validation)

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) return false;
  if (email.includes('..')) return false;
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return false;
  
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;
  
  return true;
};

/**
 * Validates name format
 */
export const isValidName = (name: string): boolean => {
  if (!name || name.trim().length < 2) return false;
  const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s'-]+$/;
  return nameRegex.test(name.trim());
};

/**
 * Simple password validation - minimum 8 characters
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Strong password validation with detailed requirements
 */
export const isStrongPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('One number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('One special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validation errors interface
 */
export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * Validates signup form with STRONG password requirements
 */
export const validateSignupForm = (
  name: string,
  email: string,
  password: string
): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Name validation
  if (!name.trim()) {
    errors.name = 'Please enter your full name';
  } else if (!isValidName(name)) {
    errors.name = 'Name must contain only letters, spaces, hyphens, and apostrophes';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  // Email validation
  if (!email.trim()) {
    errors.email = 'Please enter your email address';
  } else if (!isValidEmail(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Strong password validation
  if (!password) {
    errors.password = 'Please enter a password';
  } else {
    const strongPasswordCheck = isStrongPassword(password);
    if (!strongPasswordCheck.isValid) {
      // Show all errors in a formatted way
      errors.password = `Password must have: ${strongPasswordCheck.errors.join(', ')}`;
    }
  }
  
  return errors;
};

/**
 * Validates login form fields
 */
export const validateLoginForm = (
  email: string,
  password: string
): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Email validation
  if (!email.trim()) {
    errors.email = 'Please enter your email address';
  } else if (!isValidEmail(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!password) {
    errors.password = 'Please enter your password';
  }
  
  return errors;
};