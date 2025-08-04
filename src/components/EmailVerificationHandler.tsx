
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { cleanupAuthState } from '@/utils/authCleanup';

const EmailVerificationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleEmailVerification = async () => {
      console.log('Starting email verification process...');
      console.log('URL search params:', Object.fromEntries(searchParams.entries()));
      console.log('Full URL:', window.location.href);

      // Extract verification parameters from different possible formats
      let verificationToken = '';
      let verificationType = 'signup';

      // Try different parameter names that Supabase might use
      const possibleTokenParams = [
        'token_hash',
        'token',
        'verification_token',
        'hash'
      ];

      const possibleTypeParams = [
        'type',
        'verification_type',
        'email_type'
      ];

      // Check search params first
      for (const param of possibleTokenParams) {
        const value = searchParams.get(param);
        if (value) {
          verificationToken = value;
          console.log(`Found token in search param '${param}':`, verificationToken);
          break;
        }
      }

      for (const param of possibleTypeParams) {
        const value = searchParams.get(param);
        if (value) {
          verificationType = value;
          console.log(`Found type in search param '${param}':`, verificationType);
          break;
        }
      }

      // If no token in search params, check URL hash fragment
      if (!verificationToken) {
        const hash = window.location.hash.substring(1);
        console.log('Checking URL hash fragment:', hash);
        
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          console.log('Hash params:', Object.fromEntries(hashParams.entries()));
          
          for (const param of possibleTokenParams) {
            const value = hashParams.get(param);
            if (value) {
              verificationToken = value;
              console.log(`Found token in hash param '${param}':`, verificationToken);
              break;
            }
          }

          for (const param of possibleTypeParams) {
            const value = hashParams.get(param);
            if (value) {
              verificationType = value;
              console.log(`Found type in hash param '${param}':`, verificationType);
              break;
            }
          }
        }
      }

      if (!verificationToken) {
        console.error('No verification token found in URL');
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link. The verification token is missing from the URL. Please try clicking the link in your email again or request a new verification email.');
        return;
      }

      try {
        console.log('Attempting email verification with token:', verificationToken.substring(0, 10) + '...');
        console.log('Verification type:', verificationType);

        // Clean up any existing auth state before verification
        cleanupAuthState();

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: verificationToken,
          type: verificationType as any
        });

        console.log('Verification result:', { 
          success: !!data?.user, 
          userEmail: data?.user?.email,
          error: error?.message 
        });

        if (error) {
          console.error('Email verification error:', error);
          setVerificationStatus('error');
          
          if (error.message.includes('expired') || error.message.includes('not found')) {
            setErrorMessage('This verification link has expired or has already been used. Please request a new verification email.');
          } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
            setErrorMessage('This verification link is invalid. Please check the link or request a new verification email.');
          } else if (error.message.includes('Email link is invalid')) {
            setErrorMessage('The verification link format is invalid. Please request a new verification email.');
          } else {
            setErrorMessage(`Verification failed: ${error.message}`);
          }
          return;
        }

        if (data && data.user) {
          console.log('Email verification successful for user:', data.user.email);
          setVerificationStatus('success');
          
          // Clean up the pending verification email
          localStorage.removeItem('pendingVerificationEmail');
          
          toast({
            title: "Email verified successfully!",
            description: "You can now access your account.",
          });

          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          console.warn('Verification returned no error but no user data');
          setVerificationStatus('error');
          setErrorMessage('Verification completed but no user data was returned. Please try signing in.');
        }

      } catch (error: any) {
        console.error('Unexpected verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(`An unexpected error occurred during verification: ${error.message}`);
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, toast]);

  const handleResendVerification = async () => {
    const email = localStorage.getItem('pendingVerificationEmail');
    
    if (!email) {
      toast({
        title: "Error",
        description: "Cannot resend verification. Please try signing up again.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsResending(true);
    console.log('Resending verification email to:', email);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      });

      if (error) {
        console.error('Resend verification error:', error);
        toast({
          title: "Error",
          description: `Failed to resend verification: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Verification email resent successfully');
        toast({
          title: "Verification email sent!",
          description: "Please check your email for a new verification link.",
        });
      }
    } catch (error: any) {
      console.error('Unexpected resend error:', error);
      toast({
        title: "Error",
        description: `Failed to resend verification: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-orange-600">
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {verificationStatus === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 mx-auto text-orange-500 animate-spin" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Verification Successful!</h3>
                  <p className="text-gray-600 mt-2">
                    Your email has been verified successfully. You will be redirected to your dashboard shortly.
                  </p>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="text-center space-y-4">
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-700">Verification Failed</h3>
                  <p className="text-gray-600 mt-2 text-sm">
                    {errorMessage}
                  </p>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleGoToLogin}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerificationHandler;
