import { sanitizeInput, sanitizeHtml } from './security';

// Enhanced input validation for forms
export const validateAndSanitizeForm = <T extends Record<string, any>>(
  data: T,
  validationRules: Partial<Record<keyof T, (value: any) => string | null>>
): { isValid: boolean; errors: Record<string, string>; sanitizedData: T } => {
  const errors: Record<string, string> = {};
  const sanitizedData = {} as T;

  // Apply sanitization and validation
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    if (typeof value === 'string') {
      // Sanitize string inputs
      if (key.toLowerCase().includes('content') || key.toLowerCase().includes('description')) {
        (sanitizedData as any)[key] = sanitizeHtml(value);
      } else {
        (sanitizedData as any)[key] = sanitizeInput(value);
      }
    } else {
      (sanitizedData as any)[key] = value;
    }
    
    // Apply custom validation rules
    const validationRule = validationRules[key];
    if (validationRule) {
      const error = validationRule(sanitizedData[key]);
      if (error) {
        errors[key] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Specific validation functions
export const validateNoteContent = (content: string): string | null => {
  if (!content || content.trim().length === 0) {
    return 'Content is required';
  }
  if (content.length > 5000) {
    return 'Content must be less than 5000 characters';
  }
  return null;
};

export const validateGoalTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length > 100) {
    return 'Title must be less than 100 characters';
  }
  return null;
};

export const validateCustomWorkoutName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }
  // Check for potentially harmful content
  if (/<|>|javascript|script|eval|expression/i.test(name)) {
    return 'Name contains invalid characters';
  }
  return null;
};

export const validateShareContent = (content: string): string | null => {
  if (!content || content.trim().length === 0) {
    return 'Content is required';
  }
  if (content.length > 2000) {
    return 'Content must be less than 2000 characters';
  }
  return null;
};

// Profile field validation
export const validateDisplayName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Display name is required';
  }
  if (name.length > 50) {
    return 'Display name must be less than 50 characters';
  }
  if (/<|>|javascript|script/i.test(name)) {
    return 'Display name contains invalid characters';
  }
  return null;
};

export const validateBio = (bio: string): string | null => {
  if (bio.length > 500) {
    return 'Bio must be less than 500 characters';
  }
  return null;
};