import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { handleAuthSignIn } from '@/utils/authCleanup';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  console.log('Auth component: Rendering auth page');
  const { user, loading: authLoading, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (!authLoading && user) {
    navigate('/', { replace: true });
    return null;
  }

  // Show auth error state
  if (authError && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Authentication Error
            </CardTitle>
            <CardDescription>{authError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', formData);
    setLoading(true);
    
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        });
        
        if (error) throw error;
        
        toast({
          title: "Reset email sent",
          description: "Check your email for password reset instructions",
        });
      } else if (isLogin) {
        const { error } = await handleAuthSignIn({
          email: formData.email,
          password: formData.password
        });
        
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: formData.username
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created",
          description: "Check your email to verify your account",
        });
        
        // Clear form fields
        setFormData({
          email: '',
          password: '',
          username: ''
        });
        
        // Redirect to sign-in view
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Show loading state during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

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
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Sign In' : 'Join Inner Fire'}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? 'Enter your email to receive password reset instructions'
                : isLogin 
                ? 'Sign in to continue your plank journey' 
                : 'Start your new fitness journey today'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="pl-10"
                      required={!isLogin}
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isForgotPassword ? 'Email' : isLogin ? 'Email or Username' : 'Email'}
                  {!isLogin && <span className="text-red-500"> *</span>}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={isForgotPassword ? 'email' : isLogin ? 'text' : 'email'}
                    name="email"
                    placeholder={isForgotPassword ? 'Enter your email address' : isLogin ? 'Enter your email or username' : 'Enter your email'}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password{!isLogin && <span className="text-red-500"> *</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isForgotPassword ? 'Sending...' : isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {!isForgotPassword && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {isForgotPassword && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsLogin(true);
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;