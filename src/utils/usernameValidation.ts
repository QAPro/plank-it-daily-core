
import { checkUsernameContentSafety } from './contentFilter';

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'support', 'help', 'api', 'www', 'mail', 'email',
  'ftp', 'blog', 'news', 'about', 'contact', 'privacy', 'terms', 'legal',
  'security', 'system', 'root', 'user', 'users', 'account', 'accounts',
  'profile', 'profiles', 'settings', 'config', 'app', 'apps', 'service',
  'services', 'test', 'demo', 'example', 'sample', 'null', 'undefined',
  'anonymous', 'guest', 'public', 'private', 'official', 'staff', 'team',
  'moderator', 'mod', 'plankit', 'plank', 'workout', 'fitness'
];

export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export const validateUsernameFormat = (username: string): UsernameValidationResult => {
  // Check if username is empty
  if (!username || username.trim() === '') {
    return {
      isValid: false,
      error: 'Username is required'
    };
  }

  const trimmedUsername = username.trim();

  // Check length (3-30 characters)
  if (trimmedUsername.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long'
    };
  }

  if (trimmedUsername.length > 30) {
    return {
      isValid: false,
      error: 'Username must be 30 characters or less'
    };
  }

  // Check allowed characters (letters, numbers, underscores only)
  const allowedCharsRegex = /^[a-zA-Z0-9_]+$/;
  if (!allowedCharsRegex.test(trimmedUsername)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores'
    };
  }

  // Must start with letter or number (not underscore)
  if (trimmedUsername.startsWith('_')) {
    return {
      isValid: false,
      error: 'Username cannot start with an underscore'
    };
  }

  // Cannot end with underscore
  if (trimmedUsername.endsWith('_')) {
    return {
      isValid: false,
      error: 'Username cannot end with an underscore'
    };
  }

  // No consecutive underscores
  if (trimmedUsername.includes('__')) {
    return {
      isValid: false,
      error: 'Username cannot contain consecutive underscores'
    };
  }

  // Check against reserved usernames (case-insensitive)
  if (RESERVED_USERNAMES.includes(trimmedUsername.toLowerCase())) {
    return {
      isValid: false,
      error: 'This username is reserved and cannot be used',
      suggestions: [
        `${trimmedUsername}_user`,
        `${trimmedUsername}_2024`,
        `my_${trimmedUsername}`
      ]
    };
  }

  // Check content safety (profanity filter)
  const contentSafety = checkUsernameContentSafety(trimmedUsername);
  if (!contentSafety.isAllowed) {
    return {
      isValid: false,
      error: contentSafety.reason || 'Username contains inappropriate content',
      suggestions: contentSafety.suggestions || generateUsernameSuggestions(trimmedUsername)
    };
  }

  return { isValid: true };
};

export const sanitizeUsername = (username: string): string => {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '') // Remove invalid characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .slice(0, 30); // Ensure max length
};

export const generateUsernameSuggestions = (baseUsername: string): string[] => {
  const sanitized = sanitizeUsername(baseUsername);
  const currentYear = new Date().getFullYear();
  
  return [
    `${sanitized}_${currentYear}`,
    `${sanitized}_user`,
    `${sanitized}_${Math.floor(Math.random() * 999) + 1}`,
    `my_${sanitized}`,
    `${sanitized}_pro`
  ].filter(suggestion => suggestion.length >= 3 && suggestion.length <= 30);
};
