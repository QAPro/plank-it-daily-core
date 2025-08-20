
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Loader2, AlertCircle } from 'lucide-react';

interface EmailChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}

const EmailChangeDialog = ({ open, onOpenChange, currentEmail }: EmailChangeDialogProps) => {
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email address is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    if (email.toLowerCase() === currentEmail.toLowerCase()) {
      return 'Please enter a different email address';
    }
    
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setNewEmail(email);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateEmail(newEmail);
    if (error) {
      setValidationError(error);
      toast({
        title: "Invalid email",
        description: error,
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
        
        let errorMessage = error.message;
        if (error.message.includes('email address is already in use')) {
          errorMessage = "This email is already associated with another account.";
        } else if (error.message.includes('rate limit')) {
          errorMessage = "Please wait a few minutes before trying again.";
        }
        
        setValidationError(errorMessage);
        
        toast({
          title: "Email change failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Store pending email change locally
      localStorage.setItem('pendingEmailChange', newEmail);
      
      toast({
        title: "Verification email sent",
        description: `Please check ${newEmail} and click the verification link to complete the change.`,
      });

      onOpenChange(false);
      setNewEmail('');
      setValidationError('');
    } catch (error: any) {
      console.error('Unexpected email change error:', error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setValidationError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setNewEmail('');
      setValidationError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
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
              className="bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-gray-500">
              This is your current registered email address
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="Enter your new email address (e.g., john@example.com)"
              value={newEmail}
              onChange={handleEmailChange}
              className={validationError ? 'border-red-500 focus:border-red-500' : ''}
              required
            />
            {validationError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{validationError}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Make sure you have access to this email address
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> A verification link will be sent to your new email address. 
              You'll need to click it to complete the change. Your current email will remain active until then.
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!validationError}
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
