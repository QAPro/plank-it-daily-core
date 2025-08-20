
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Palette } from "lucide-react";
import AvatarSelector from "./AvatarSelector";
import ProfilePictureUpload from "./ProfilePictureUpload";
import { cn } from "@/lib/utils";

interface ProfileImageSelectorProps {
  selectedUrl?: string | null;
  onSelect: (url: string | null) => void;
  className?: string;
}

const ProfileImageSelector = ({ 
  selectedUrl, 
  onSelect, 
  className 
}: ProfileImageSelectorProps) => {
  const [activeTab, setActiveTab] = useState("avatars");

  // Determine if the current selection is a custom upload or preset avatar
  const isCustomImage = selectedUrl && !selectedUrl.includes('avatars/cartoon-');

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm text-orange-100/90">Choose your profile image</div>
      
      <Tabs 
        value={isCustomImage ? "upload" : activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger 
            value="avatars" 
            className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white"
          >
            <Palette className="w-4 h-4" />
            Avatars
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white"
          >
            <User className="w-4 h-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="avatars" className="mt-4">
          <AvatarSelector
            selectedUrl={isCustomImage ? null : selectedUrl}
            onSelect={onSelect}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <ProfilePictureUpload
            currentImageUrl={isCustomImage ? selectedUrl : null}
            onImageChange={onSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileImageSelector;
