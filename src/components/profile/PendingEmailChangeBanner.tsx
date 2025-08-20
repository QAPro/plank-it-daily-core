
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, X, Loader2, RefreshCw } from 'lucide-react';

interface PendingEmailChangeBannerProps {
  pendingEmail: string;
  onClear: () => void;
}

const PendingEmailChangeBanner = ({ pendingEmail, onClear }: PendingEmailChangeBannerProps) => {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'email_change',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      });

      if (error) {
        console.error('Resend email change error:', error);
        toast({
          title: "Failed to resend",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification email resent",
          description: "Please check your email for the verification link.",
        });
      }
    } catch (error: any) {
      console.error('Unexpected resend error:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('pendingEmailChange');
    onClear();
    toast({
      title: "Email change cancelled",
      description: "Your email change request has been cancelled.",
    });
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Mail className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="text-orange-800">
            Email change pending: Please check <strong>{pendingEmail}</strong> and click the verification link.
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            {isResending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            <span className="ml-1">Resend</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="text-orange-700 hover:bg-orange-100"
          >
            <X className="h-3 w-3" />
            <span className="ml-1">Cancel</span>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PendingEmailChangeBanner;
