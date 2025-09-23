import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PasswordReset = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokensValidated, setTokensValidated] = useState(false);
  const [resetTokens, setResetTokens] = useState<{
    access_token: string;
    refresh_token: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState<{
    password: string | null;
    confirmPassword: string | null;
  }>({
    password: null,
    confirmPassword: null
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const validateResetTokens = async () => {
      // Parse tokens from URL fragment (after #)
      const parseFragmentParams = () => {
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        return {
          access_token: params.get('access_token'),
          refresh_token: params.get('refresh_token'),
          type: params.get('type')
        };
      };

      const { access_token, refresh_token, type } = parseFragmentParams();
      
      // Check if this is a password recovery link and we have the required tokens
      if (type !== 'recovery' || !access_token || !refresh_token) {
        toast({
          title: "Invalid reset link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      try {
        // Validate tokens without setting the session by attempting to decode them
        // We'll create a temporary session just to check if tokens are valid
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token
        });

        if (error) {
          console.error('Token validation error:', error);
          toast({
            title: "Invalid or expired reset link",
            description: "This password reset link has expired. Please request a new one.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // If tokens are valid, immediately sign out but store the tokens for later use
        await supabase.auth.signOut();
        
        // Store the validated tokens for use when updating password
        setResetTokens({ access_token, refresh_token });
        setTokensValidated(true);

      } catch (error) {
        console.error('Token validation failed:', error);
        toast({
          title: "Invalid reset link",
          description: "Unable to validate the reset link. Please request a new one.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    validateResetTokens();
  }, [toast, navigate]);

  const validatePasswords = () => {
    const errors = { password: null, confirmPassword: null };
    let hasErrors = false;

    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
      hasErrors = true;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetTokens) {
      toast({
        title: "Error",
        description: "Reset session has expired. Please request a new password reset link.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      if (!validatePasswords()) {
        return;
      }

      // First, establish a temporary session with the reset tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: resetTokens.access_token,
        refresh_token: resetTokens.refresh_token
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        toast({
          title: "Reset link expired",
          description: "This reset link has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Error updating password",
          description: error.message || "Unable to update password. Please try again.",
          variant: "destructive",
        });
        // Sign out on error to maintain security
        await supabase.auth.signOut();
        return;
      }

      toast({
        title: "Password updated successfully",
        description: "Your password has been updated and you are now logged in.",
      });

      // Clear the URL fragment to remove the tokens from the browser
      window.history.replaceState(null, '', window.location.pathname);

      // Redirect to home page since user is now authenticated
      navigate('/');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      // Sign out on error to maintain security
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof typeof fieldErrors;
    
    setFormData({
      ...formData,
      [fieldName]: e.target.value
    });
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: null }));
    }
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
              Set New Password
            </CardTitle>
            <CardDescription>
              {!tokensValidated ? 'Validating reset link...' : 'Enter your new password below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!tokensValidated ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your new password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 ${fieldErrors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>{fieldErrors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 ${fieldErrors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>{fieldErrors.confirmPassword}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    disabled={loading}
                  >
                    Back to sign in
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PasswordReset;