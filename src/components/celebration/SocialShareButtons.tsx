
import React from "react";
import { motion } from "framer-motion";
import { Share2, Twitter, Facebook, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialSharingService, type ShareData } from "@/services/socialSharingService";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  shareData: ShareData;
}

const SocialShareButtons = ({ shareData }: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleNativeShare = async () => {
    const shared = await SocialSharingService.shareNative(shareData);
    if (!shared) {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleTwitterShare = () => {
    SocialSharingService.shareToTwitter(shareData);
    toast({
      title: "Shared to Twitter!",
      description: "Opening Twitter to share your achievement.",
    });
  };

  const handleFacebookShare = () => {
    SocialSharingService.shareToFacebook(shareData);
    toast({
      title: "Shared to Facebook!",
      description: "Opening Facebook to share your achievement.",
    });
  };

  const handleCopy = async () => {
    try {
      await SocialSharingService.copyToClipboard(shareData);
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
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Native Share (if available) */}
        {navigator.share && (
          <Button
            onClick={handleNativeShare}
            variant="outline"
            size="sm"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white flex-1 min-w-0"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        )}

        {/* Twitter */}
        <Button
          onClick={handleTwitterShare}
          variant="outline"
          size="sm"
          className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white flex-1 min-w-0"
        >
          <Twitter className="w-4 h-4 mr-1" />
          Twitter
        </Button>

        {/* Facebook */}
        <Button
          onClick={handleFacebookShare}
          variant="outline"
          size="sm"
          className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white flex-1 min-w-0"
        >
          <Facebook className="w-4 h-4 mr-1" />
          Facebook
        </Button>

        {/* Copy */}
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white flex-1 min-w-0"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-1" />
          ) : (
            <Copy className="w-4 h-4 mr-1" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </motion.div>
  );
};

export default SocialShareButtons;
