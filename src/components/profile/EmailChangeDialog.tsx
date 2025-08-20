
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2 } from 'lucide-react';

interface EmailChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}

const EmailChangeDialog = ({ open, onOpenChange, currentEmail }: EmailChangeDialogProps) => {
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your new email address.",
        variant: "destructive",
      });
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      toast({
        title: "Same email",
        description: "Please enter a different email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      );

      if (error) {
        console.error('Email change error:', error);
        
        if (error.message.includes('email address is already in use')) {
          toast({
            title: "Email already in use",
            description: "This email is already associated with another account.",
            variant: "destructive",
          });
        } else if (error.message.includes('rate limit')) {
          toast({
            title: "Too many requests",
            description: "Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed to send verification",
            description: error.message || "Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Store pending email change locally
      localStorage.setItem('pendingEmailChange', newEmail);
      
      toast({
        title: "Verification email sent",
        description: "Please check your new email address and click the verification link to complete the change.",
      });

      onOpenChange(false);
      setNewEmail('');
    } catch (error: any) {
      console.error('Unexpected email change error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-orange-500" />
            Change Email Address
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmail">Current Email</Label>
            <Input
              id="currentEmail"
              type="email"
              value={currentEmail}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="Enter your new email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              A verification link will be sent to your new email address. You'll need to click it to complete the change.
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailChangeDialog;
