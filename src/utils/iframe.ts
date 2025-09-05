/**
 * Utility functions for iframe detection and handling
 */

/**
 * Checks if the current window is running inside an iframe
 */
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin restrictions,
    // we're likely in an iframe
    return true;
  }
};

/**
 * Checks if we're in the Lovable preview iframe specifically
 */
export const isInLovablePreview = (): boolean => {
  if (!isInIframe()) return false;
  
  try {
    // Check for Lovable-specific indicators
    const hostname = window.location.hostname;
    const search = window.location.search;
    
    // Lovable preview domains typically have .lovable.app or specific patterns
    return hostname.includes('lovable.app') || 
           search.includes('preview') ||
           document.referrer.includes('lovable');
  } catch (e) {
    return false;
  }
};

/**
 * Opens the current page in a new tab/window
 */
export const openInNewTab = (): void => {
  const currentUrl = window.location.href;
  window.open(currentUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Gets the standalone URL for the current page
 */
export const getStandaloneUrl = (): string => {
  return window.location.href;
};