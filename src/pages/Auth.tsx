
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { handleAuthSignIn } from '@/utils/authCleanup';
import { validateUsernameFormat } from '@/utils/usernameValidation';
import { validateDisplayName } from '@/utils/inputValidation';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: ''
  });
  
  // Inline message state for persistent UI feedback
  const [inlineMessage, setInlineMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null;
    content: string;
    visible: boolean;
  }>({ type: null, content: '', visible: false });
  
  // Track if email was prefilled due to existing account
  const [emailPrefilled, setEmailPrefilled] = useState(false);
  
  // Field-specific error states
  const [fieldErrors, setFieldErrors] = useState<{
    email: string | null;
    password: string | null;
    username: string | null;
    fullName: string | null;
  }>({
    email: null,
    password: null,
    username: null,
    fullName: null
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Handle password reset request
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
          console.error('Password reset error:', error);
          toast({
            title: "Error",
            description: error.message || "Unable to send reset email. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Reset email sent",
          description: "Please check your email for password reset instructions.",
        });

        setInlineMessage({
          type: 'success',
          content: 'Password reset email sent! Check your inbox (and spam folder) for reset instructions.',
          visible: true
        });

        // Clear form and switch back to login
        setFormData(prev => ({ ...prev, password: '' }));
        setIsForgotPassword(false);
        setIsLogin(true);
        return;
      } else if (isLogin) {
        // Check if the identifier is an email or username
        const isEmail = formData.email.includes('@');
        
        if (isEmail) {
          console.log('Attempting email sign in...');
          // Sign in with email using the robust helper
          const { error } = await handleAuthSignIn({
            email: formData.email,
            password: formData.password
          });

          if (error) {
            if (error.message.includes('Email not confirmed')) {
              toast({
                title: "Email not verified",
                description: "Please check your email and click the verification link before signing in.",
                variant: "destructive",
              });
            } else if (error.message.includes('Invalid login credentials')) {
              toast({
                title: "Invalid credentials",
                description: "The email or password you entered is incorrect.",
                variant: "destructive",
              });
            } else {
              throw error;
            }
            return;
          }
        } else {
          // Username-based sign in - need to find the associated email first
          console.log('Looking up email for username:', formData.email);
          
          const { data: userData, error: lookupError } = await supabase
            .from('users')
            .select('email')
            .eq('username', formData.email.toLowerCase())
            .single();

          if (lookupError || !userData) {
            console.error('Username lookup failed:', lookupError);
            toast({
              title: "Login failed",
              description: "Invalid username or password.",
              variant: "destructive",
            });
            return;
          }

          // Now sign in with the found email
          console.log('Attempting email sign in with found email...');
          const { error } = await handleAuthSignIn({
            email: userData.email,
            password: formData.password
          });

          if (error) {
            console.error('Sign in error:', error);
            if (error.message.includes('Invalid login credentials')) {
              toast({
                title: "Invalid credentials",
                description: "The username or password you entered is incorrect.",
                variant: "destructive",
              });
            } else {
              throw error;
            }
            return;
          }
        }

        console.log('Sign in successful, redirecting...');
        navigate('/dashboard');
      } else {
        // Sign up mode - validate input first
        
        // Clear previous field errors
        setFieldErrors({ email: null, password: null, username: null, fullName: null });
        
        // Validate username
        const usernameValidation = validateUsernameFormat(formData.username.trim());
        if (!usernameValidation.isValid) {
          setFieldErrors(prev => ({ ...prev, username: usernameValidation.error || "Please choose a different username." }));
          toast({
            title: "Invalid username",
            description: usernameValidation.error || "Please choose a different username.",
            variant: "destructive",
          });
          return;
        }
        
        // Validate full name if provided (it's optional)
        if (formData.fullName.trim()) {
          const nameError = validateDisplayName(formData.fullName.trim());
          if (nameError) {
            setFieldErrors(prev => ({ ...prev, fullName: nameError }));
            toast({
              title: "Invalid full name",
              description: nameError,
              variant: "destructive",
            });
            return;
          }
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify`,
            data: {
              full_name: formData.fullName.trim() || null,
              username: formData.username.trim(),
            }
          }
        });

        if (error) {
          console.error('Sign up error:', error);
          // Enhanced error detection for various Supabase error types
          const errorMessage = error.message?.toLowerCase() || '';
          
          if (errorMessage.includes('user already registered') || 
              errorMessage.includes('email already registered') ||
              errorMessage.includes('already been registered') ||
              error.status === 422) {
            
            // Set field-specific error
            setFieldErrors(prev => ({ ...prev, email: "An account with this email already exists. Please sign in instead." }));
            
            toast({
              title: "Account already exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            
            // Enhanced UX: preserve email and show inline message
            const currentEmail = formData.email;
            setIsLogin(true);
            setFormData(prev => ({ ...prev, email: currentEmail, password: '', fullName: '', username: '' }));
            setEmailPrefilled(true);
            setInlineMessage({
              type: 'info',
              content: 'Switched to sign in - we found an existing account with this email address.',
              visible: true
            });
          } else if (errorMessage.includes('password should be at least') ||
                     errorMessage.includes('password') && errorMessage.includes('6')) {
            setFieldErrors(prev => ({ ...prev, password: "Password should be at least 6 characters long." }));
            toast({
              title: "Weak password",
              description: "Password should be at least 6 characters long.",
              variant: "destructive",
            });
          } else if (errorMessage.includes('username already exists') ||
                     errorMessage.includes('username') && errorMessage.includes('taken')) {
            setFieldErrors(prev => ({ ...prev, username: "This username is already taken. Please choose a different one." }));
            toast({
              title: "Username taken",
              description: "This username is already taken. Please choose a different one.",
              variant: "destructive",
            });
          } else if (errorMessage.includes('invalid email') ||
                     errorMessage.includes('email') && errorMessage.includes('invalid')) {
            setFieldErrors(prev => ({ ...prev, email: "Please enter a valid email address." }));
            toast({
              title: "Invalid email",
              description: "Please enter a valid email address.",
              variant: "destructive",
            });
          } else if (errorMessage.includes('rate limit') ||
                     errorMessage.includes('too many')) {
            toast({
              title: "Too many attempts",
              description: "Please wait a moment before trying again.",
              variant: "destructive",
            });
          } else {
            // Catch-all for unknown errors
            toast({
              title: "Signup failed",
              description: error.message || "Unable to create account. Please try again or contact support if the problem persists.",
              variant: "destructive",
            });
            console.error('Unhandled signup error:', error);
          }
          return;
        }

        console.log('Sign up successful, email verification required');
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before signing in. The verification link will redirect you back to this app.",
        });

        // Show persistent inline success message
        setInlineMessage({
          type: 'success',
          content: 'Account created successfully! Check your email (including spam folder) to verify your account before signing in.',
          visible: true
        });

        // Clear form but keep the success message visible
        setFormData({ email: '', password: '', fullName: '', username: '' });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
    
    // Clear prefill indicator when user starts typing in email
    if (e.target.name === 'email' && emailPrefilled) {
      setEmailPrefilled(false);
    }
  };

  // Helper function to get inline message icon and styling
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getMessageStyling = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-700';
      case 'error': return 'bg-red-50 border-red-200 text-red-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return '';
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
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Join PlankCoach'}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? 'Enter your email to receive password reset instructions'
                : isLogin 
                ? 'Sign in to continue your plank journey' 
                : 'Start your daily plank routine today'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !isForgotPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name (optional)"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`pl-10 ${fieldErrors.fullName ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>{fieldErrors.fullName}</span>
                    </div>
                  )}
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="username"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`pl-10 ${fieldErrors.username ? 'border-red-300 focus:border-red-500' : ''}`}
                      required={!isLogin}
                      minLength={3}
                      maxLength={20}
                      pattern="^[a-zA-Z0-9_]+$"
                      title="Username must be 3-20 characters long and contain only letters, numbers, and underscores"
                    />
                  </div>
                  {fieldErrors.username ? (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>{fieldErrors.username}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isForgotPassword ? 'Email' : isLogin ? 'Email or Username' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={isForgotPassword ? 'email' : isLogin ? 'text' : 'email'}
                    name="email"
                    placeholder={isForgotPassword ? 'Enter your email address' : isLogin ? 'Enter your email or username' : 'Enter your email'}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${emailPrefilled ? 'bg-blue-50 border-blue-200' : ''} ${fieldErrors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
                {emailPrefilled && !fieldErrors.email && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Info className="h-3 w-3" />
                    <span>Email prefilled from your signup attempt</span>
                  </div>
                )}
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
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
              )}

              {isLogin && !isForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setIsLogin(false);
                      setFormData(prev => ({ ...prev, password: '' }));
                      setInlineMessage({ type: null, content: '', visible: false });
                      setFieldErrors({ email: null, password: null, username: null, fullName: null });
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    disabled={loading}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading}
              >
                {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Email' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Inline Message Display */}
            {inlineMessage.visible && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-md border flex items-start gap-3 ${getMessageStyling(inlineMessage.type || 'info')}`}
              >
                {getMessageIcon(inlineMessage.type || 'info')}
                <div className="flex-1">
                  <p className="text-sm font-medium">{inlineMessage.content}</p>
                  {inlineMessage.type === 'success' && (
                    <p className="text-xs mt-1 opacity-80">
                      Didn't receive an email? Check your spam folder or try signing up again.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setInlineMessage(prev => ({ ...prev, visible: false }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            <div className="mt-6 text-center">
              {isForgotPassword ? (
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsLogin(true);
                    setInlineMessage({ type: null, content: '', visible: false });
                    setFieldErrors({ email: null, password: null, username: null, fullName: null });
                  }}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  disabled={loading}
                >
                  Back to sign in
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setIsForgotPassword(false);
                    // Clear messages, field errors, and prefill status when switching modes
                    setInlineMessage({ type: null, content: '', visible: false });
                    setFieldErrors({ email: null, password: null, username: null, fullName: null });
                    setEmailPrefilled(false);
                  }}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  disabled={loading}
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
