/**
 * Badge Asset Utilities
 * Handles badge image URLs for the achievement system
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET_NAME = "achievement-badges";

/**
 * Get the full URL for a badge asset
 * @param badgeFileName - The badge file name (e.g., "badge_milestones_first_steps_common.png")
 * @returns Full public URL to the badge image
 */
export const getBadgeUrl = (badgeFileName: string): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${badgeFileName}`;
};

/**
 * Get a grayscale version of the badge URL (for locked/unearned badges)
 * Note: This uses CSS filters on the client side, not separate images
 * @param badgeFileName - The badge file name
 * @returns Object with URL and CSS filter class
 */
export const getLockedBadgeStyle = (badgeFileName: string) => {
  return {
    url: getBadgeUrl(badgeFileName),
    filter: 'grayscale(100%) opacity(0.6)',
    className: 'filter grayscale opacity-60'
  };
};

/**
 * Preload badge images for better performance
 * @param badgeFileNames - Array of badge file names to preload
 */
export const preloadBadges = (badgeFileNames: string[]) => {
  badgeFileNames.forEach(fileName => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = getBadgeUrl(fileName);
    document.head.appendChild(link);
  });
};

/**
 * Check if a badge image exists and is accessible
 * @param badgeFileName - The badge file name to check
 * @returns Promise<boolean> - True if badge exists and is accessible
 */
export const verifyBadgeExists = async (badgeFileName: string): Promise<boolean> => {
  try {
    const response = await fetch(getBadgeUrl(badgeFileName), { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Failed to verify badge: ${badgeFileName}`, error);
    return false;
  }
};
