import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {};

    if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully"
      });

      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (newPassword.length === 0) return { strength: 0, label: '' };
    
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(newPassword)) strength++;
    if (/(?=.*[A-Z])/.test(newPassword)) strength++;
    if (/(?=.*\d)/.test(newPassword)) strength++;
    if (/(?=.*[^a-zA-Z0-9])/.test(newPassword)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { strength: (strength / 5) * 100, label: labels[Math.min(strength - 1, 4)] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter a new secure password for your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors({});
                }}
                placeholder="Enter new password"
                className={errors.newPassword ? 'border-destructive' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword}</p>
            )}
            
            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      passwordStrength.strength < 40 ? 'bg-destructive' :
                      passwordStrength.strength < 70 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Strength: {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({});
              }}
              placeholder="Confirm new password"
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-secondary/50 p-3 rounded-lg">
            <p className="text-xs font-medium mb-2 text-foreground">Password must contain:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                • At least 8 characters
              </li>
              <li className={/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : ''}>
                • One lowercase letter
              </li>
              <li className={/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : ''}>
                • One uppercase letter
              </li>
              <li className={/(?=.*\d)/.test(newPassword) ? 'text-green-600' : ''}>
                • One number
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !newPassword || !confirmPassword}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Change Password
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
