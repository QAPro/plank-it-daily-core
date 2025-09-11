// Content filtering utilities for usernames, names, and other user input
// Detects inappropriate content including profanity, offensive terms, and variations

// Basic profanity list - this is a minimal set for demonstration
// In production, you'd want a more comprehensive list from a dedicated service
const PROFANITY_LIST = [
  // Common offensive terms (using partial words to avoid explicit content)
  'damn', 'hell', 'crap', 'piss', 'shit', 'fuck', 'bitch', 'asshole', 'bastard',
  'slut', 'whore', 'cock', 'dick', 'pussy', 'tits', 'ass', 'sex', 'porn',
  // Offensive slurs and hate speech (abbreviated for safety)
  'nazi', 'hitler', 'jihad', 'terrorist', 'kill', 'die', 'death', 'murder',
  // Inappropriate fitness-related terms
  'sexy', 'nude', 'naked', 'hot', 'horny', 'fetish', 'kinky',
  // Common l33t speak variations will be handled by normalization
];

// Additional patterns that might indicate inappropriate content
const SUSPICIOUS_PATTERNS = [
  /(.)\1{4,}/, // Repeated characters (like aaaa, 1111)
  /\d{3,}/, // Long number sequences
  /^[^a-zA-Z]*$/, // Only symbols/numbers
];

export interface ContentFilterResult {
  isAllowed: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
}

/**
 * Normalizes text to catch common evasion techniques
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[0]/g, 'o')
    .replace(/[1]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[@]/g, 'a')
    .replace(/[\$]/g, 's')
    .replace(/[!]/g, 'i')
    .replace(/[+]/g, 't')
    .replace(/[\s\-_\.]+/g, '') // Remove spaces, dashes, underscores, dots
    .replace(/[^a-z]/g, ''); // Remove any remaining special characters
};

/**
 * Checks if text contains profanity or inappropriate content
 */
export const checkContentSafety = (text: string): ContentFilterResult => {
  if (!text || text.trim() === '') {
    return { isAllowed: true, severity: 'low' };
  }

  const normalizedText = normalizeText(text);
  const originalText = text.toLowerCase().trim();

  // Check against profanity list
  for (const word of PROFANITY_LIST) {
    if (normalizedText.includes(word) || originalText.includes(word)) {
      return {
        isAllowed: false,
        reason: 'Contains inappropriate language',
        severity: 'high',
        suggestions: generateCleanSuggestions(text)
      };
    }
  }

  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(originalText)) {
      return {
        isAllowed: false,
        reason: 'Contains suspicious patterns',
        severity: 'medium',
        suggestions: generateCleanSuggestions(text)
      };
    }
  }

  // Check for excessive special characters
  const specialCharCount = (originalText.match(/[^a-zA-Z0-9_]/g) || []).length;
  if (specialCharCount > originalText.length * 0.5) {
    return {
      isAllowed: false,
      reason: 'Contains too many special characters',
      severity: 'medium',
      suggestions: generateCleanSuggestions(text)
    };
  }

  return { isAllowed: true, severity: 'low' };
};

/**
 * Generates clean alternatives for blocked content
 */
const generateCleanSuggestions = (originalText: string): string[] => {
  const baseText = originalText.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  const currentYear = new Date().getFullYear();
  
  const suggestions = [];
  
  // Try to create meaningful alternatives
  if (baseText.length >= 3) {
    suggestions.push(
      `${baseText}_user`,
      `${baseText}_${currentYear}`,
      `${baseText}_pro`,
      `fitness_${baseText}`,
      `workout_${baseText}`
    );
  }
  
  // Add some generic alternatives
  suggestions.push(
    `user_${Math.floor(Math.random() * 999) + 1}`,
    `fitness_user_${Math.floor(Math.random() * 99) + 1}`,
    `plank_master_${Math.floor(Math.random() * 99) + 1}`
  );

  // Filter to valid length and unique values
  return [...new Set(suggestions)]
    .filter(s => s.length >= 3 && s.length <= 30)
    .slice(0, 3);
};

/**
 * Specifically for username filtering with additional context
 */
export const checkUsernameContentSafety = (username: string): ContentFilterResult => {
  const result = checkContentSafety(username);
  
  // Additional username-specific checks
  if (result.isAllowed && username.toLowerCase().includes('admin')) {
    return {
      isAllowed: false,
      reason: 'Username suggests administrative privileges',
      severity: 'medium',
      suggestions: generateCleanSuggestions(username)
    };
  }
  
  return result;
};

/**
 * For display names with different rules (more lenient)
 */
export const checkDisplayNameContentSafety = (name: string): ContentFilterResult => {
  // Display names can be more flexible but still need basic safety
  const result = checkContentSafety(name);
  
  // Allow some patterns that might be blocked for usernames
  if (result.reason === 'Contains suspicious patterns' && result.severity === 'medium') {
    // Be more lenient with display names for patterns
    return { isAllowed: true, severity: 'low' };
  }
  
  return result;
};