import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Share2, CheckCircle, Info, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataPortabilityHelper: React.FC = () => {
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'ready'>('idle');
  const { toast } = useToast();

  const handleExportData = async (exportType: string) => {
    setExportStatus('processing');
    
    // Simulate export processing
    setTimeout(() => {
      setExportStatus('ready');
      toast({
        title: "Export Ready! 🎉",
        description: `Your ${exportType} data has been prepared for download.`,
      });
    }, 2000);
  };

  const exportTypes = [
    {
      id: 'complete',
      name: 'Complete Data Export',
      description: 'All your workout data, achievements, and progress in a comprehensive package',
      icon: <FileText className="w-5 h-5" />,
      formats: ['JSON', 'CSV', 'PDF Report'],
      estimatedTime: '< 1 minute'
    },
    {
      id: 'workouts',
      name: 'Workout History',
      description: 'Your complete workout sessions, routines, and performance metrics',
      icon: <Download className="w-5 h-5" />,
      formats: ['CSV', 'JSON'],
      estimatedTime: '< 30 seconds'
    },
    {
      id: 'achievements',
      name: 'Achievements & Progress',
      description: 'All your unlocked achievements, milestones, and progress photos',
      icon: <CheckCircle className="w-5 h-5" />,
      formats: ['JSON', 'PDF'],
      estimatedTime: '< 30 seconds'
    },
    {
      id: 'social',
      name: 'Social Content',
      description: 'Your posts, comments, connections, and community contributions',
      icon: <Share2 className="w-5 h-5" />,
      formats: ['JSON', 'HTML'],
      estimatedTime: '< 45 seconds'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Your Data, Your Choice</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We believe your fitness journey belongs to you. Export your data anytime, 
          in any format you need, with complete transparency and no barriers.
        </p>
      </motion.div>

      {/* Data Transparency Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Info className="w-5 h-5" />
              Complete Data Transparency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
                <div className="text-sm text-muted-foreground">Data Accessible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                <div className="text-sm text-muted-foreground">Hidden Fees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">Always</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-center text-muted-foreground">
              Your progress, achievements, and connections are yours to keep, share, or take with you anywhere.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportTypes.map((exportType, index) => (
          <motion.div
            key={exportType.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {exportType.icon}
                  {exportType.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {exportType.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Available Formats:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exportType.formats.map((format) => (
                      <Badge key={format} variant="secondary" className="text-xs">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-medium text-green-600">
                    {exportType.estimatedTime}
                  </span>
                </div>

                <Button 
                  onClick={() => handleExportData(exportType.name)}
                  disabled={exportStatus === 'processing'}
                  className="w-full"
                  variant="outline"
                >
                  {exportStatus === 'processing' ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Preparing...
                    </>
                  ) : exportStatus === 'ready' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Download Ready
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export {exportType.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Benefits of Data Portability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Why We Make Your Data Portable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Your Rights</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Own and control your fitness data
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Share achievements with other platforms
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Create personal backups anytime
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Use data for personal analysis
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Our Commitment</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    No artificial barriers or complex processes
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Standard formats for easy importing
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Fast, reliable export processing
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    Transparent about what we collect
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DataPortabilityHelper;