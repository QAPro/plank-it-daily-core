
import { motion } from "framer-motion";
import { Clock, Calendar, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { formatDistanceToNow } from "date-fns";


const SessionHistory = () => {
  const { data: sessions, isLoading, error } = useSessionHistory(50);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "text-green-600 bg-green-50";
      case 2: return "text-yellow-600 bg-yellow-50";
      case 3: return "text-orange-600 bg-orange-50";
      case 4: return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
    <Card className="bg-white border-orange-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-orange-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Failed to load session history
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="bg-white border-orange-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No sessions yet</p>
            <p className="text-sm text-gray-400">
              Complete your first plank to see your history here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-orange-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {session.exercises?.name || 'Unknown Exercise'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(session.duration_seconds)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(session.completed_at || ''), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {session.exercises?.difficulty_level && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(session.exercises.difficulty_level)}`}>
                      Level {session.exercises.difficulty_level}
                    </span>
                  )}
                  
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
  );
};

export default SessionHistory;
