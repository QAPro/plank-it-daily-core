
import { motion } from "framer-motion";
import { Calendar, Trophy, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { useStreakTracking } from "@/hooks/useStreakTracking";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { format } from "date-fns";

const AccountStats = () => {
  const { sessions } = useSessionHistory();
  const { streak } = useStreakTracking();
  const { achievements } = useUserAchievements();

  const totalWorkouts = sessions.length;
  const totalTime = sessions.reduce((acc, session) => acc + session.duration_seconds, 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalTime / totalWorkouts) : 0;
  const joinDate = format(new Date(), 'MMMM yyyy'); // This would be user creation date in real app

  const stats = [
    {
      icon: Calendar,
      label: "Total Workouts",
      value: totalWorkouts.toString(),
      color: "text-blue-500 bg-blue-50",
    },
    {
      icon: Clock,
      label: "Total Time",
      value: `${Math.floor(totalTime / 60)}m`,
      color: "text-green-500 bg-green-50",
    },
    {
      icon: TrendingUp,
      label: "Current Streak",
      value: `${streak?.current_streak || 0} days`,
      color: "text-orange-500 bg-orange-50",
    },
    {
      icon: Trophy,
      label: "Achievements",
      value: achievements.length.toString(),
      color: "text-purple-500 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Account Statistics</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Member since</span>
            <span className="text-sm font-medium text-gray-800">{joinDate}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Average workout</span>
            <span className="text-sm font-medium text-gray-800">{averageDuration}s</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Longest streak</span>
            <span className="text-sm font-medium text-gray-800">{streak?.longest_streak || 0} days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountStats;
