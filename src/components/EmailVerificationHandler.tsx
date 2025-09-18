
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

const EmailVerificationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailVerification = async () => {
      const token = searchParams.get('token');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      console.log('Email verification params:', { token, tokenHash, type, url: window.location.href });
      
      // Check if we have either token or token_hash
      const verificationToken = tokenHash || token;
      
      if (!verificationToken || !type) {
        console.error('Missing verification parameters:', { token, tokenHash, type });
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        toast({
          title: "Invalid verification link",
          description: "The verification link appears to be invalid or incomplete.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Handle the verification based on type
        if (type === 'signup' || type === 'email_change') {
          console.log('Attempting verification with:', { type, tokenType: tokenHash ? 'token_hash' : 'token' });
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: verificationToken,
            type: type as 'signup' | 'email_change'
          });

          if (error) {
            console.error('Email verification error:', error);
            setStatus('error');
            
            if (error.message.includes('expired')) {
              setMessage('This verification link has expired. Please request a new one.');
              toast({
                title: "Link expired",
                description: "Please request a new verification email.",
                variant: "destructive",
              });
            } else if (error.message.includes('invalid')) {
              setMessage('This verification link is invalid. Please check your email and try again.');
              toast({
                title: "Invalid link",
                description: "The verification link is not valid.",
                variant: "destructive",
              });
            } else {
              setMessage('Email verification failed. Please try again.');
              toast({
                title: "Verification failed",
                description: error.message || "Please try again.",
                variant: "destructive",
              });
            }
            return;
          }

          console.log('Verification response:', { data, error });

          if (data.user) {
            console.log('Email verification successful for user:', data.user.email);
            setStatus('success');
            
            if (type === 'signup') {
              setMessage('Your email has been verified successfully! Welcome to PlankIt.');
              toast({
                title: "Email verified!",
                description: "Welcome to PlankIt! Your account is now active.",
              });
            } else if (type === 'email_change') {
              setMessage('Your email address has been updated successfully!');
              
              // Clear pending email change from localStorage
              localStorage.removeItem('pendingEmailChange');
              
              toast({
                title: "Email updated!",
                description: "Your email address has been changed successfully.",
              });
            }

            // Force a session refresh to ensure the user is properly signed in
            // after successful verification
            setTimeout(async () => {
              try {
                const { data: refreshedSession } = await supabase.auth.getSession();
                console.log('Refreshed session after verification:', refreshedSession.session?.user?.email);
                
                // Redirect to main app after verification and session refresh
                navigate('/', { replace: true });
              } catch (refreshError) {
                console.error('Error refreshing session after verification:', refreshError);
                // Still redirect even if refresh fails
                navigate('/', { replace: true });
              }
            }, 2000);
          } else {
            console.error('Verification succeeded but no user data returned');
            setStatus('error');
            setMessage('Verification completed, but there was an issue with your session. Please try signing in again.');
            toast({
              title: "Verification incomplete",
              description: "Please try signing in to your account.",
              variant: "destructive",
            });
          }
        } else {
          setStatus('error');
          setMessage('Unknown verification type. Please contact support.');
          toast({
            title: "Unknown verification type",
            description: "Please contact support for assistance.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Unexpected verification error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification. Please try again.');
        toast({
          title: "Verification error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, toast]);

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying your email...';
      case 'success':
        return 'Email verified!';
      case 'error':
        return 'Verification failed';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                Redirecting you to the app in a few seconds...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  If this problem persists, please contact our support team.
                </p>
              </div>
              <Button
                onClick={() => navigate('/', { replace: true })}
                variant="outline"
                className="w-full"
              >
                Return to PlankIt
              </Button>
            </div>
          )}
          
          {status === 'verifying' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-sm text-blue-800">
                <Mail className="h-4 w-4" />
                <span>Processing your verification...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationHandler;
