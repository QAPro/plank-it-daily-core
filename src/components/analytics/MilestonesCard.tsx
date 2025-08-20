
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award } from 'lucide-react';
import type { MilestoneProgress } from '@/utils/analyticsUtils';

interface MilestonesCardProps {
  milestones: MilestoneProgress[];
}

const MilestonesCard: React.FC<MilestonesCardProps> = ({ milestones }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="w-5 h-5 mr-2 text-purple-500" />
          Milestones & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{milestone.icon}</span>
                  <span className="font-medium">{milestone.title}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {milestone.current}/{milestone.target}
                </span>
              </div>
              <Progress 
                value={milestone.percentage} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(milestone.percentage)}% complete</span>
                {milestone.percentage >= 100 ? (
                  <span className="text-green-600 font-medium">🎉 Achieved!</span>
                ) : (
                  <span>
                    {milestone.target - milestone.current} to go
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestonesCard;
