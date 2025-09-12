import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { handleAuthSignOut } from '@/utils/authCleanup';
import { useToast } from '@/hooks/use-toast';

const AppHeader = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const onSignOut = async () => {
    try {
      toast({
        title: "Signing out...",
        description: "Please wait while we sign you out."
      });
      await handleAuthSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out error",
        description: "There was an issue signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-orange-100">
      <div className="flex items-center gap-2 text-orange-800">
        <User className="h-5 w-5" />
        <span className="font-medium">{user.email}</span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onSignOut}
        className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </header>
  );
};

export default AppHeader;