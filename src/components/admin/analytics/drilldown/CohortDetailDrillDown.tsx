
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Activity } from 'lucide-react';

interface CohortDetailDrillDownProps {
  cohortId: string;
  metadata?: Record<string, any>;
}

const CohortDetailDrillDown: React.FC<CohortDetailDrillDownProps> = ({ cohortId, metadata }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>Cohort Analysis: {cohortId}</CardTitle>
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Detailed cohort analysis will be implemented in the next phase of development.
          This will include retention rates, behavioral patterns, and conversion metrics.
        </p>
      </CardContent>
    </Card>
  );
};

export default CohortDetailDrillDown;
