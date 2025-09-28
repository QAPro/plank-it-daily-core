import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Key, Save, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface VapidKeySecretManagerProps {
  onKeysUpdated?: () => void;
}

export const VapidKeySecretManager: React.FC<VapidKeySecretManagerProps> = ({ onKeysUpdated }) => {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateSecrets = async () => {
    if (!publicKey.trim() || !privateKey.trim()) {
      toast.error('Both keys required', { description: 'Enter both public and private VAPID keys.' });
      return;
    }

    // Basic validation
    if (publicKey.length < 80 || publicKey.length > 90) {
      toast.error('Invalid public key', { description: 'Public key should be 87-88 characters.' });
      return;
    }

    if (privateKey.length < 40 || privateKey.length > 50) {
      toast.error('Invalid private key', { description: 'Private key should be 43-44 characters.' });
      return;
    }

    setIsUpdating(true);
    try {
      // Note: In a real implementation, these would be secure API calls to update Supabase secrets
      // For now, we'll show instructions to the user
      toast.success('Keys validated', { 
        description: 'Now update VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Supabase secrets.' 
      });
      
      if (onKeysUpdated) {
        onKeysUpdated();
      }
    } catch (error) {
      toast.error('Update failed', { description: 'Failed to update VAPID keys.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const generateNewKeys = () => {
    const instructions = `To generate new VAPID keys, run these commands:

Node.js method:
npm install web-push
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"

Or use online generator:
https://vapidkeys.com/

Copy the "Public Key" to VAPID_PUBLIC_KEY
Copy the "Private Key" to VAPID_PRIVATE_KEY`;

    navigator.clipboard.writeText(instructions);
    toast.success('Instructions copied', { description: 'VAPID key generation instructions copied to clipboard.' });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Update VAPID Keys
        </CardTitle>
        <CardDescription>
          Enter the correct VAPID key pair to fix push notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Issue:</strong> The VAPID_PRIVATE_KEY in Supabase is in the wrong format. 
            We need the 43-44 character base64url "d" value from a P-256 ECDSA key pair.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="publicKey">VAPID Public Key (87-88 characters)</Label>
            <Input
              id="publicKey"
              type={showKeys ? 'text' : 'password'}
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="Enter VAPID public key..."
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="privateKey">VAPID Private Key (43-44 characters)</Label>
            <Input
              id="privateKey"
              type={showKeys ? 'text' : 'password'}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter VAPID private key..."
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showKeys ? 'Hide' : 'Show'} Keys
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewKeys}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Generation Instructions
            </Button>
          </div>

          <Button 
            onClick={handleUpdateSecrets} 
            disabled={isUpdating || !publicKey.trim() || !privateKey.trim()}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Validating...' : 'Validate Keys'}
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Next Steps:</strong> After validation, manually update the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY 
            secrets in your Supabase project settings, then test again.
          </AlertDescription>
        </Alert>

        <div className="text-sm space-y-2 p-3 bg-muted rounded-md">
          <p className="font-medium">Quick Key Format Check:</p>
          <p>• Public key length: {publicKey.length} (need 87-88)</p>
          <p>• Private key length: {privateKey.length} (need 43-44)</p>
          <p>• Valid base64url: {publicKey && /^[A-Za-z0-9_-]+$/.test(publicKey) ? '✓' : '✗'} / {privateKey && /^[A-Za-z0-9_-]+$/.test(privateKey) ? '✓' : '✗'}</p>
        </div>
      </CardContent>
    </Card>
  );
};