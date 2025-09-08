import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Download, FileText, Clock, Database, Link, Zap } from 'lucide-react';
import { useRequestDataExport } from '@/hooks/useInvestmentProtection';
import { useToast } from '@/hooks/use-toast';

const DataExportComplexity: React.FC = () => {
  const [exportType, setExportType] = useState<'partial' | 'full' | 'investment_summary'>('partial');
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState<string[]>([]);
  const [showComplexityAnalysis, setShowComplexityAnalysis] = useState(false);
  const requestExport = useRequestDataExport();
  const { toast } = useToast();

  const exportTypes = {
    partial: {
      name: 'Partial Export',
      description: 'Basic workout data only',
      complexity: 2.1,
      interconnections: 12,
      estimatedHours: 24,
      warnings: [
        'Excludes social capital and reputation data',
        'Missing cross-platform progress interconnections',
        'Streak multipliers not included in export'
      ]
    },
    full: {
      name: 'Full Export',
      description: 'Complete data with all interconnections',
      complexity: 8.7,
      interconnections: 247,
      estimatedHours: 168,
      warnings: [
        'Requires manual review of 247+ data interconnections',
        'Export may take up to 7 days due to complex dependencies',
        'Some proprietary scoring algorithms cannot be exported',
        'Social network data requires separate consent process'
      ]
    },
    investment_summary: {
      name: 'Investment Summary',
      description: 'Portfolio value and abandonment cost analysis',
      complexity: 5.4,
      interconnections: 89,
      estimatedHours: 72,
      warnings: [
        'Investment calculations use proprietary algorithms',
        'Historical data may be incomplete due to system dependencies',
        'Real-time multipliers cannot be exported as static data'
      ]
    }
  };

  const requiredWarnings = [
    'I understand that exported data may be incomplete due to system interconnections',
    'I acknowledge that some data cannot be meaningfully exported without platform context',
    'I accept that reimporting this data elsewhere would require significant technical expertise',
    'I understand that my investment value calculations are platform-specific and non-transferable'
  ];

  const handleWarningChange = (warning: string, checked: boolean) => {
    if (checked) {
      setAcknowledgedWarnings([...acknowledgedWarnings, warning]);
    } else {
      setAcknowledgedWarnings(acknowledgedWarnings.filter(w => w !== warning));
    }
  };

  const handleRequestExport = async () => {
    if (acknowledgedWarnings.length < requiredWarnings.length) {
      toast({
        title: "All warnings must be acknowledged",
        description: "Please acknowledge all warnings before requesting export.",
        variant: "destructive",
      });
      return;
    }

    try {
      await requestExport.mutateAsync(exportType);
      toast({
        title: "Export Request Submitted",
        description: `Your ${exportTypes[exportType].name.toLowerCase()} request has been queued for processing.`,
      });
    } catch (error) {
      toast({
        title: "Export Request Failed",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    }
  };

  const selectedType = exportTypes[exportType];

  return (
    <div className="space-y-6">
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Download className="w-5 h-5" />
            Data Export Request
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Request an export of your platform data. Due to complex interconnections, exports require manual processing.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Export Type Selection */}
            <div>
              <h4 className="font-medium mb-3">Select Export Type</h4>
              <RadioGroup value={exportType} onValueChange={(value: any) => setExportType(value)}>
                {Object.entries(exportTypes).map(([key, type]) => (
                  <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value={key} id={key} />
                    <div className="flex-1">
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {type.name}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          Complexity: {type.complexity}/10
                        </Badge>
                        <Badge variant="outline">
                          {type.interconnections} connections
                        </Badge>
                        <Badge variant="outline">
                          ~{type.estimatedHours}h processing
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Complexity Analysis */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                  <Database className="w-4 h-4" />
                  Export Complexity Analysis: {selectedType.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{selectedType.complexity}</div>
                    <div className="text-muted-foreground">Complexity Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{selectedType.interconnections}</div>
                    <div className="text-muted-foreground">Interconnections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{selectedType.estimatedHours}h</div>
                    <div className="text-muted-foreground">Processing Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">Manual</div>
                    <div className="text-muted-foreground">Review Required</div>
                  </div>
                </div>

                <Progress value={(selectedType.complexity / 10) * 100} className="h-2" />

                <div className="space-y-2">
                  <h5 className="font-medium text-red-600">Export Limitations:</h5>
                  <ul className="space-y-1">
                    {selectedType.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700 dark:text-red-300">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Required Acknowledgments */}
            <Card className="border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-600">
                  <FileText className="w-4 h-4" />
                  Required Acknowledgments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requiredWarnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Checkbox
                      id={`warning-${index}`}
                      checked={acknowledgedWarnings.includes(warning)}
                      onCheckedChange={(checked) => handleWarningChange(warning, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`warning-${index}`} 
                      className="text-sm cursor-pointer leading-5"
                    >
                      {warning}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Data Interconnection Warning */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                  <Link className="w-4 h-4" />
                  Data Interconnection Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Your data exists within a complex web of {selectedType.interconnections} interconnected systems. 
                    Extracting this data while maintaining its contextual meaning requires significant manual processing.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h5 className="font-medium text-red-700 dark:text-red-300 mb-1">Dependent Systems</h5>
                      <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                        <li>• Social reputation calculations</li>
                        <li>• Streak multiplier algorithms</li>
                        <li>• Mastery progression matrices</li>
                        <li>• Investment value computations</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h5 className="font-medium text-red-700 dark:text-red-300 mb-1">Export Challenges</h5>
                      <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                        <li>• Proprietary algorithm dependencies</li>
                        <li>• Real-time calculation requirements</li>
                        <li>• Cross-user relationship data</li>
                        <li>• Time-sensitive multiplier states</li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      💡 Your investment value is intrinsically tied to remaining within this ecosystem
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleRequestExport}
              disabled={acknowledgedWarnings.length < requiredWarnings.length || requestExport.isPending}
              className="w-full"
              variant="outline"
            >
              {requestExport.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Export Request...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Request {selectedType.name} ({selectedType.estimatedHours}h processing)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportComplexity;