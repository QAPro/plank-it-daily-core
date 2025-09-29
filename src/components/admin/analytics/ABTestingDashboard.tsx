
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Beaker, 
  TrendingUp, 
  Users, 
  Target,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ABTest {
  id: string;
  feature_name: string;
  variants: string[];
  is_active: boolean;
  total_users: number;
  conversion_rates: Record<string, number>;
  statistical_significance: number;
  confidence_level: number;
}

const ABTestingDashboard = () => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const { data: abTests, isLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      // Fetch real A/B test data from Supabase
      const { data: experiments, error: experimentsError } = await supabase
        .from('ab_test_experiments')
        .select('*, ab_test_statistics(*)');
      
      if (experimentsError) {
        console.error('Error fetching experiments:', experimentsError);
        return [];
      }

      if (!experiments || experiments.length === 0) {
        return [];
      }

      // Transform the data to match the ABTest interface
      const transformedTests: ABTest[] = experiments.map((exp) => {
        const stats = exp.ab_test_statistics || [];
        const conversion_rates: Record<string, number> = {};
        
        stats.forEach((stat) => {
          conversion_rates[stat.variant] = stat.conversion_rate || 0;
        });

        // Calculate average statistical significance
        const avgSignificance = stats.length > 0 
          ? stats.reduce((sum, stat) => sum + (stat.statistical_significance || 0), 0) / stats.length
          : 0;

        return {
          id: exp.id,
          feature_name: exp.experiment_name,
          variants: Object.keys(conversion_rates),
          is_active: exp.status === 'running',
          total_users: stats.reduce((sum, stat) => sum + (stat.total_users || 0), 0),
          conversion_rates,
          statistical_significance: avgSignificance,
          confidence_level: exp.confidence_level || 95,
        };
      });

      return transformedTests;
    },
  });

  const getVariantPerformance = (test: ABTest, variant: string) => {
    const rate = test.conversion_rates[variant];
    const bestRate = Math.max(...Object.values(test.conversion_rates));
    const isWinning = rate === bestRate;
    const lift = bestRate > 0 ? ((rate - bestRate) / bestRate * 100) : 0;
    
    return { rate, isWinning, lift: lift === 0 ? 0 : Math.abs(lift) };
  };

  const getTestStatus = (test: ABTest) => {
    if (!test.is_active) return { status: 'completed', color: 'bg-gray-500' };
    if (test.statistical_significance >= 95) return { status: 'significant', color: 'bg-green-500' };
    if (test.statistical_significance >= 80) return { status: 'trending', color: 'bg-yellow-500' };
    return { status: 'collecting', color: 'bg-blue-500' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">A/B Testing Dashboard</h2>
          <p className="text-gray-600">Monitor and analyze experimental features</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Beaker className="w-4 h-4 mr-2" />
          Create New Test
        </Button>
      </div>

      {/* Active Tests Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Beaker className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{abTests?.filter(t => t.is_active).length || 0}</p>
            <p className="text-sm text-gray-600">Active Tests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{abTests?.filter(t => t.statistical_significance >= 95).length || 0}</p>
            <p className="text-sm text-gray-600">Significant Results</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">
              {abTests?.reduce((sum, test) => sum + test.total_users, 0) || 0}
            </p>
            <p className="text-sm text-gray-600">Total Participants</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">
              {abTests ? Math.round(abTests.reduce((sum, test) => sum + test.statistical_significance, 0) / abTests.length) : 0}%
            </p>
            <p className="text-sm text-gray-600">Avg Confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {abTests && abTests.length > 0 ? (
          abTests.map((test) => {
            const { status, color } = getTestStatus(test);
            const bestVariant = Object.entries(test.conversion_rates).reduce((a, b) => 
              test.conversion_rates[a[0]] > test.conversion_rates[b[0]] ? a : b
            );

            return (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="capitalize text-lg">
                        {test.feature_name.replace(/_/g, ' ')}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {test.total_users} participants • {test.variants.length} variants
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <Badge variant="outline" className="capitalize">
                        {status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Statistical Significance */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Statistical Significance</span>
                      <span>{test.statistical_significance}%</span>
                    </div>
                    <Progress value={test.statistical_significance} className="h-2" />
                  </div>

                  {/* Variant Performance */}
                  <div className="space-y-3">
                    <p className="font-medium text-sm">Variant Performance</p>
                    {test.variants.map((variant) => {
                      const { rate, isWinning, lift } = getVariantPerformance(test, variant);
                      
                      return (
                        <div key={variant} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="capitalize font-medium text-sm">{variant}</span>
                            {isWinning && (
                              <Badge variant="default" className="text-xs">
                                Winner
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{rate}%</p>
                            {lift > 0 && !isWinning && (
                              <p className="text-xs text-red-600">-{lift.toFixed(1)}%</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {test.is_active ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Play className="w-3 h-3 mr-1" />
                          Implement Winner
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Full Report
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Recommendations */}
                  {test.statistical_significance >= 95 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">
                        🎉 Test Complete!
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        "{bestVariant[0]}" variant shows {bestVariant[1]}% conversion rate. 
                        Consider implementing this variant.
                      </p>
                    </div>
                  )}

                  {test.is_active && test.statistical_significance < 80 && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">
                        📊 Still Collecting Data
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Need more data for reliable results. Current confidence: {test.statistical_significance}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-12 text-center">
                <Beaker className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No A/B Tests Configured
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Create A/B test experiments to analyze feature variants and optimize user experience. 
                  Click "Create New Test" to get started.
                </p>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Beaker className="w-4 h-4 mr-2" />
                  Create Your First Test
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Test Creation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>A/B Testing Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Test Setup Guidelines</h4>
              <div className="space-y-2 text-sm">
                <div>• Define clear success metrics before starting</div>
                <div>• Ensure sufficient sample size for reliable results</div>
                <div>• Test one variable at a time for clear insights</div>
                <div>• Run tests for at least one full business cycle</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Statistical Requirements</h4>
              <div className="space-y-2 text-sm">
                <div>• Aim for 95% statistical significance</div>
                <div>• Minimum 100 conversions per variant</div>
                <div>• Equal traffic split between variants</div>
                <div>• Account for external factors and seasonality</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ABTestingDashboard;
