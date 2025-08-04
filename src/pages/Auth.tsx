import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { handleAuthSignIn } from '@/utils/authCleanup';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
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
                description: "Please check your email and password and try again.",
                variant: "destructive",
              });
            } else {
              throw error;
            }
            return;
          }
        } else {
          console.log('Attempting username sign in...');
          // Find user by username first
          const { data: userData, error: userError } = await supabase
            .rpc('find_user_by_username_or_email', { identifier: formData.email });

          if (userError || !userData || userData.length === 0) {
            toast({
              title: "Username not found",
              description: "Please check your username or try signing in with your email instead.",
              variant: "destructive",
            });
            return;
          }

          // Sign in with the found email using the robust helper
          const { error } = await handleAuthSignIn({
            email: userData[0].email,
            password: formData.password
          });

          if (error) {
            if (error.message.includes('Invalid login credentials')) {
              toast({
                title: "Invalid credentials",
                description: "Please check your password and try again.",
                variant: "destructive",
              });
            } else {
              throw error;
            }
            return;
          }
        }

        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        
        // The handleAuthSignIn will handle the redirect
      } else {
        console.log('Attempting sign up...');
        
        // Validate required fields for signup
        if (!formData.username.trim()) {
          toast({
            title: "Username required",
            description: "Please enter a username to create your account.",
            variant: "destructive",
          });
          return;
        }

        // Store email for potential verification resend
        localStorage.setItem('pendingVerificationEmail', formData.email);

        // Sign up with proper email redirect configuration and user metadata
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
          if (error.message.includes('User already registered')) {
            toast({
              title: "Account already exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else if (error.message.includes('Password should be at least')) {
            toast({
              title: "Weak password",
              description: "Password should be at least 6 characters long.",
              variant: "destructive",
            });
          } else if (error.message.includes('Username already exists')) {
            toast({
              title: "Username taken",
              description: "This username is already taken. Please choose a different one.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
          return;
        }

        console.log('Sign up successful, email verification required');
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before signing in. The verification link will redirect you back to this app.",
        });

        // Clear form and switch to login
        setFormData({ email: '', password: '', fullName: '', username: '' });
        setIsLogin(true);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
              {isLogin ? 'Welcome Back' : 'Join PlankIt'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Sign in to continue your plank journey' 
                : 'Start your daily plank routine today'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
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
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
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
                      pattern="^[a-zA-Z0-9_]+$"
                      title="Username must be 3-20 characters long and contain only letters, numbers, and underscores"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {isLogin ? 'Email or Username' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={isLogin ? 'text' : 'email'}
                    name="email"
                    placeholder={isLogin ? 'Enter your email or username' : 'Enter your email'}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

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
                    className="pl-10 pr-10"
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
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                disabled={loading}
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
