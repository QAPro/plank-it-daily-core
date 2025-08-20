
import { useState, useRef } from "react";
import { Upload, X, Image, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  className?: string;
}

const ProfilePictureUpload = ({ 
  currentImageUrl, 
  onImageChange, 
  className 
}: ProfilePictureUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please upload a JPEG, PNG, or WebP image file.'
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB.'
      };
    }

    return { isValid: true };
  };

  const generateFileName = (file: File): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    return `${user?.id}-${timestamp}-${randomString}.${fileExtension}`;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      // Generate unique filename
      const fileName = generateFileName(file);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(`${user.id}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path);

      // Update parent component
      onImageChange(publicUrl);

      toast({
        title: "Upload successful",
        description: "Your profile picture has been uploaded.",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      
      // Clear preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-medium text-orange-100/90">Custom Profile Picture</div>
      
      <div className="flex items-center gap-4">
        {/* Image Preview */}
        <div className="relative">
          {displayImageUrl ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20">
              <img
                src={displayImageUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              {!isUploading && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-16 h-16 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-white/50" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="bg-white/20 text-white hover:bg-white/30 border-0"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
          
          <div className="text-xs text-orange-100/70 mt-1">
            JPEG, PNG, WebP • Max 5MB
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload profile picture"
        />
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-orange-100/80">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
          Uploading your picture...
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
