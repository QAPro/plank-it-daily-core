
import { supabase } from "@/integrations/supabase/client";

export const isCustomUploadedImage = (imageUrl: string | null): boolean => {
  if (!imageUrl) return false;
  
  // Check if the URL is from our profile-pictures storage bucket
  return imageUrl.includes('/profile-pictures/') && 
         imageUrl.includes('supabase.co/storage/');
};

export const extractFilePathFromUrl = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/profile-pictures\/(.+)$/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
};

export const deleteProfilePicture = async (imageUrl: string): Promise<void> => {
  if (!isCustomUploadedImage(imageUrl)) {
    return; // Don't try to delete preset avatars
  }

  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) {
    console.warn('Could not extract file path from URL:', imageUrl);
    return;
  }

  try {
    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting profile picture:', error);
    }
  } catch (error) {
    console.error('Error deleting profile picture:', error);
  }
};

export const cleanupOldProfilePictures = async (userId: string, keepUrl?: string): Promise<void> => {
  try {
    // List all files for this user
    const { data: files, error } = await supabase.storage
      .from('profile-pictures')
      .list(userId);

    if (error || !files) {
      return;
    }

    // Filter out the current profile picture
    const filesToDelete = files
      .filter(file => {
        if (!keepUrl) return true;
        const keepPath = extractFilePathFromUrl(keepUrl);
        return keepPath !== `${userId}/${file.name}`;
      })
      .map(file => `${userId}/${file.name}`);

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error cleaning up old profile pictures:', deleteError);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old profile pictures:', error);
  }
};
