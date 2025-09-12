import React from 'react';
import { LogOut } from 'lucide-react';
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
    <header className="flex items-center justify-end p-4 bg-gradient-to-br from-orange-50 to-red-50">
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