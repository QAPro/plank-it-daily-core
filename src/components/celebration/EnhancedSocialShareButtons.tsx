
import { motion } from "framer-motion";
import { 
  Share2, Twitter, Facebook, Copy, Check, Instagram, 
  Linkedin, MessageCircle, Send, ExternalLink, Camera, Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enhancedSocialSharingService } from "@/services/enhancedSocialSharingService";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { EnhancedShareData, ShareTemplate } from "@/types/socialSharing";

interface EnhancedSocialShareButtonsProps {
  shareData: EnhancedShareData;
  variant?: 'compact' | 'full';
  showImageGeneration?: boolean;
}

const EnhancedSocialShareButtons = ({ 
  shareData, 
  variant = 'full',
  showImageGeneration = true 
}: EnhancedSocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<ShareTemplate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const templateType = shareData.achievement ? 'achievement' : 
                        shareData.streakDays ? 'streak' : 'workout';
    const loadedTemplates = await enhancedSocialSharingService.getShareTemplates(templateType);
    setTemplates(loadedTemplates);
    if (loadedTemplates.length > 0) {
      setSelectedTemplate(loadedTemplates[0].id);
    }
  };

  const generateShareImage = async () => {
    if (!selectedTemplate) return;
    
    setGeneratingImage(true);
    try {
      const imageDataUrl = await enhancedSocialSharingService.generateShareImage(
        shareData, 
        selectedTemplate
      );
      setShareImage(imageDataUrl);
      toast({
        title: "Image generated!",
        description: "Your shareable image is ready.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate image",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateShareText = (): string => {
    if (shareData.achievement) {
      return `🏆 Just unlocked "${shareData.achievement}" on PlankIt! ${shareData.achievement_description || ''} #PlankIt #Achievement #Fitness`;
    }
    
    if (shareData.streakDays) {
      return `🔥 ${shareData.streakDays}-day workout streak on PlankIt! Consistency is key! 💪 #PlankIt #Streak #Fitness`;
    }
    
    if (shareData.exercise && shareData.duration) {
      const minutes = Math.floor(shareData.duration / 60);
      const seconds = shareData.duration % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      const pbText = shareData.personalBest ? " 🏆 New personal best!" : "";
      
      return `💪 Just completed a ${timeStr} ${shareData.exercise} on PlankIt!${pbText} #PlankIt #Fitness #CoreStrength`;
    }
    
    return "Check out my fitness progress on PlankIt! 💪 #PlankIt #Fitness";
  };

  const handleNativeShare = async () => {
    const shareText = generateShareText();
    
    if (navigator.share) {
      const shareData: ShareData = {
        title: 'My PlankIt Achievement',
        text: shareText,
        url: window.location.origin,
      };

      if (shareImage) {
        try {
          const file = await fetch(shareImage).then(r => r.blob()).then(blob => 
            new File([blob], 'plankit-share.png', { type: 'image/png' })
          );
          if (navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (error) {
          console.log('File sharing not supported');
        }
      }

      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Native sharing cancelled');
      }
    } else {
      handleCopy();
    }
  };

  const handleInstagramShare = async () => {
    const shareText = generateShareText();
    
    try {
      if (shareImage) {
        await enhancedSocialSharingService.shareToInstagram(shareImage, shareText);
      } else {
        toast({
          title: "Generate an image first",
          description: "Instagram sharing works best with images. Generate one using the templates above.",
        });
      }
    } catch (error) {
      toast({
        title: "Instagram sharing failed",
        description: "Please try the native share option or copy the text manually.",
        variant: "destructive",
      });
    }
  };

  const handleTwitterShare = () => {
    const shareText = generateShareText();
    enhancedSocialSharingService.shareToTwitter(shareText, shareImage || undefined);
    toast({
      title: "Shared to Twitter!",
      description: "Opening Twitter to share your achievement.",
    });
  };

  const handleFacebookShare = () => {
    const shareText = generateShareText();
    enhancedSocialSharingService.shareToFacebook(shareText, shareImage || undefined);
    toast({
      title: "Shared to Facebook!",
      description: "Opening Facebook to share your achievement.",
    });
  };

  const handleLinkedInShare = () => {
    const shareText = generateShareText();
    enhancedSocialSharingService.shareToLinkedIn(shareText, shareImage || undefined);
    toast({
      title: "Shared to LinkedIn!",
      description: "Opening LinkedIn to share your professional wellness achievement.",
    });
  };

  const handleWhatsAppShare = () => {
    const shareText = generateShareText();
    enhancedSocialSharingService.shareToWhatsApp(shareText);
    toast({
      title: "Shared to WhatsApp!",
      description: "Opening WhatsApp to share with your contacts.",
    });
  };

  const handleTelegramShare = () => {
    const shareText = generateShareText();
    enhancedSocialSharingService.shareToTelegram(shareText);
    toast({
      title: "Shared to Telegram!",
      description: "Opening Telegram to share with your contacts.",
    });
  };

  const handleCopy = async () => {
    try {
      const shareText = generateShareText();
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Share text copied successfully.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = await enhancedSocialSharingService.copyShareableLink(shareData);
      toast({
        title: "Shareable link copied!",
        description: "Link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        <Button onClick={handleNativeShare} variant="outline" size="sm">
          <Share2 className="w-4 h-4" />
        </Button>
        <Button onClick={handleCopy} variant="outline" size="sm">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.4 }}
      className="bg-white/10 rounded-lg p-4 mb-4"
    >
      <h4 className="text-sm font-semibold mb-3 text-center opacity-90">
        Share Your Achievement! 🎉
      </h4>

      {showImageGeneration && (
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="flex-1 bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Choose template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={generateShareImage}
              disabled={generatingImage || !selectedTemplate}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20"
            >
              <Camera className="w-4 h-4 mr-1" />
              {generatingImage ? 'Generating...' : 'Generate'}
            </Button>
          </div>
          
          {shareImage && (
            <div className="text-center">
              <img 
                src={shareImage} 
                alt="Generated share image" 
                className="max-w-32 max-h-32 mx-auto rounded border-2 border-white/30"
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Native Share */}
        {navigator.share && (
          <Button
            onClick={handleNativeShare}
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/20"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        )}

        {/* Instagram */}
        <Button
          onClick={handleInstagramShare}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20"
        >
          <Instagram className="w-4 h-4 mr-1" />
          Instagram
        </Button>

        {/* Twitter */}
        <Button
          onClick={handleTwitterShare}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20"
        >
          <Twitter className="w-4 h-4 mr-1" />
          Twitter
        </Button>

        {/* Facebook */}
        <Button
          onClick={handleFacebookShare}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20"
        >
          <Facebook className="w-4 h-4 mr-1" />
          Facebook
        </Button>

        {/* LinkedIn */}
        <Button
          onClick={handleLinkedInShare}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20"
        >
          <Linkedin className="w-4 h-4 mr-1" />
          LinkedIn
        </Button>

        {/* WhatsApp */}
        <Button
          onClick={handleWhatsAppShare}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          WhatsApp
        </Button>

        {/* Telegram */}
        <Button
          onClick={handleTelegramShare}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20"
        >
          <Send className="w-4 h-4 mr-1" />
          Telegram
        </Button>

        {/* Copy Text */}
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-1" />
          ) : (
            <Copy className="w-4 h-4 mr-1" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>

        {/* Copy Link */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Copy Link
        </Button>
      </div>

      <div className="text-xs text-center opacity-75">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-1 text-white/70 hover:text-white">
              <Users className="w-3 h-3 mr-1" />
              Community Features
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Community Sharing</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Share to the PlankIt community, create challenges, and motivate friends!
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Users className="w-4 h-4 mr-1" />
                  Community Feed
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Users className="w-4 h-4 mr-1" />
                  Create Challenge
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Community features coming soon!
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default EnhancedSocialShareButtons;
