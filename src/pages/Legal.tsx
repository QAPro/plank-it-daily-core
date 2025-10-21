import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Legal = () => {
  const navigate = useNavigate();

  const MenuItem = ({ label, onClick }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Legal</h1>
            <p className="text-muted-foreground">Important documents and policies</p>
          </div>
        </motion.div>

        {/* Legal Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MenuItem 
                label="Privacy Policy" 
                onClick={() => navigate('/privacy-policy')} 
              />
              <MenuItem 
                label="Terms of Service" 
                onClick={() => navigate('/terms-of-service')} 
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Legal;
