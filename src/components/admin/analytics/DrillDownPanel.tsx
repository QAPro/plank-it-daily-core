import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, User, Activity, Users, Calendar } from 'lucide-react';
import { useAdminAnalytics } from '@/contexts/AdminAnalyticsContext';
import UserDetailDrillDown from './drilldown/UserDetailDrillDown';
import ExerciseDetailDrillDown from './drilldown/ExerciseDetailDrillDown';
import CohortDetailDrillDown from './drilldown/CohortDetailDrillDown';
import TimeframeDrillDown from './drilldown/TimeframeDrillDown';

const DrillDownPanel = () => {
  const { drillDownState, clearDrillDown } = useAdminAnalytics();

  if (!drillDownState.type || !drillDownState.value) {
    return null;
  }

  const getIcon = () => {
    switch (drillDownState.type) {
      case 'user': return <User className="h-4 w-4" />;
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'cohort': return <Users className="h-4 w-4" />;
      case 'timeframe': return <Calendar className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTitle = () => {
    switch (drillDownState.type) {
      case 'user': return `User Details: ${drillDownState.metadata?.username || drillDownState.value}`;
      case 'exercise': return `Exercise Analysis: ${drillDownState.metadata?.name || drillDownState.value}`;
      case 'cohort': return `Cohort Analysis: ${drillDownState.value}`;
      case 'timeframe': return `Time Period: ${drillDownState.value}`;
      default: return 'Detailed Analysis';
    }
  };

  const renderDrillDownContent = () => {
    switch (drillDownState.type) {
      case 'user':
        return <UserDetailDrillDown userId={drillDownState.value} metadata={drillDownState.metadata} />;
      case 'exercise':
        return <ExerciseDetailDrillDown exerciseId={drillDownState.value} metadata={drillDownState.metadata} />;
      case 'cohort':
        return <CohortDetailDrillDown cohortId={drillDownState.value} metadata={drillDownState.metadata} />;
      case 'timeframe':
        return <TimeframeDrillDown timeframe={drillDownState.value} metadata={drillDownState.metadata} />;
      default:
        return <div className="p-4 text-center text-muted-foreground">No details available</div>;
    }
  };

  return (
    <Card className="mt-6 border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">{getTitle()}</CardTitle>
            <Badge variant="secondary" className="ml-2">
              Drill-down Active
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearDrillDown}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderDrillDownContent()}
      </CardContent>
    </Card>
  );
};

export default DrillDownPanel;
