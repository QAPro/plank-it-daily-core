import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calculator, DollarSign, Clock, TrendingDown, Shield, Zap } from 'lucide-react';
import { useCalculateAbandonmentCost } from '@/hooks/useInvestmentProtection';

interface AbandonmentCostResult {
  cost_24h: number;
  cost_7d: number;
  cost_30d: number;
  recovery_difficulty: number;
}

const AbandonmentCostCalculator: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AbandonmentCostResult | null>(null);
  const calculateCost = useCalculateAbandonmentCost();

  const handleCalculate = async () => {
    try {
      const result = await calculateCost.mutateAsync();
      setResults(result);
      setShowResults(true);
    } catch (error) {
      console.error('Error calculating abandonment cost:', error);
    }
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const getDifficultyLevel = (score: number) => {
    if (score < 2) return { label: 'Recoverable', color: 'bg-green-500', description: 'You could rebuild this investment' };
    if (score < 4) return { label: 'Challenging', color: 'bg-yellow-500', description: 'Significant effort required to rebuild' };
    if (score < 7) return { label: 'Severe', color: 'bg-orange-500', description: 'Extremely difficult to recover' };
    return { label: 'Irreversible', color: 'bg-red-500', description: 'This investment cannot be rebuilt' };
  };

  const getImpactWarnings = (results: AbandonmentCostResult) => {
    const warnings = [];
    
    if (results.cost_24h > 50) {
      warnings.push("⚠️ You'll lose significant streak multipliers within 24 hours");
    }
    if (results.cost_7d > 200) {
      warnings.push("🔥 Week-long absence will reset major progress systems");
    }
    if (results.cost_30d > 1000) {
      warnings.push("💀 30-day abandonment means permanent loss of exclusive access");
    }
    if (results.recovery_difficulty > 7) {
      warnings.push("⛔ Your investment complexity makes recovery nearly impossible");
    }

    return warnings;
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Investment Abandonment Cost Calculator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Calculate the true cost of leaving the platform and losing your accumulated investment
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Disclaimer</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This calculation shows the <strong>irreversible losses</strong> you would face by abandoning your investment. 
                These values represent interconnected progress that cannot be recovered or transferred.
              </p>
            </div>

            <Button 
              onClick={handleCalculate}
              disabled={calculateCost.isPending}
              className="w-full"
              variant="outline"
            >
              {calculateCost.isPending ? (
                <>
                  <Calculator className="w-4 h-4 mr-2 animate-spin" />
                  Calculating Complex Investment Web...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate My Abandonment Cost
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showResults && results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  24 Hour Loss
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(results.cost_24h)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Immediate streak penalties
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                  7 Day Loss
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(results.cost_7d)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  System resets + access loss
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  30 Day Loss
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(results.cost_30d)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete investment loss
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recovery Difficulty */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Shield className="w-5 h-5" />
                Recovery Difficulty Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Difficulty Level</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getDifficultyLevel(results.recovery_difficulty).color}`} />
                    <Badge variant="outline" className="text-sm">
                      {getDifficultyLevel(results.recovery_difficulty).label}
                    </Badge>
                  </div>
                </div>
                
                <Progress value={(results.recovery_difficulty / 10) * 100} className="h-3" />
                
                <p className="text-sm text-muted-foreground">
                  {getDifficultyLevel(results.recovery_difficulty).description}
                </p>

                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Recovery Score: {results.recovery_difficulty.toFixed(1)}/10.0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Warnings */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Zap className="w-5 h-5" />
                Critical Impact Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getImpactWarnings(results).map((warning, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{warning}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investment Protection Summary */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Investment Protection Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Risk Exposure:</span>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(results.cost_30d)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Platform Lock-in Factor:</span>
                    <div className="text-lg font-bold text-primary">
                      {((results.recovery_difficulty / 10) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium text-primary mb-2">🔒 Your Investment is Protected By:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Deep cross-system data interconnections</li>
                    <li>• Time-sensitive streak multiplier dependencies</li>
                    <li>• Exclusive access privileges tied to accumulated progress</li>
                    <li>• Social capital that cannot be transferred or exported</li>
                    <li>• Seasonal certifications with expiration mechanics</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Your investment web is designed to provide maximum value retention and growth protection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AbandonmentCostCalculator;