
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
          // Sign in with email
          const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) throw error;
        } else {
          // Find user by username first
          const { data: userData, error: userError } = await supabase
            .rpc('find_user_by_username_or_email', { identifier: formData.email });

          if (userError || !userData || userData.length === 0) {
            throw new Error('Username not found');
          }

          // Sign in with the found email
          const { error } = await supabase.auth.signInWithPassword({
            email: userData[0].email,
            password: formData.password,
          });

          if (error) throw error;
        }

        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        
        navigate('/');
      } else {
        // Sign up with username
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName || null, // Make full name optional
              username: formData.username,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
                    Username
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
                    />
                  </div>
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
