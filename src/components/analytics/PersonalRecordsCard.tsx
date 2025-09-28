import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { PersonalRecord } from '@/utils/analyticsUtils';

interface PersonalRecordsCardProps {
  records: PersonalRecord[];
}

const PersonalRecordsCard = ({ records }: PersonalRecordsCardProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Personal Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Complete more sessions to set personal records!
            </p>
          ) : (
            records.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    {index === 0 ? (
                      <Trophy className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{record.exercise}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(record.achievedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-orange-600">
                    {formatDuration(record.duration)}
                  </span>
                  {record.isRecent && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span className="text-xs">New!</span>
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalRecordsCard;
