import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PrivateProfilePlaceholderProps {
  message?: string;
}

const PrivateProfilePlaceholder = ({ 
  message = "This profile is private" 
}: PrivateProfilePlaceholderProps) => {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {message}
          </h3>
          <p className="text-muted-foreground">
            You need to be friends to view this content
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivateProfilePlaceholder;
