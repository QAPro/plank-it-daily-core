
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Clock, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatsTab = () => {
  const weeklyData = [
    { day: "Mon", completed: false },
    { day: "Tue", completed: false },
    { day: "Wed", completed: false },
    { day: "Thu", completed: false },
    { day: "Fri", completed: false },
    { day: "Sat", completed: false },
    { day: "Sun", completed: false }
  ];

  const achievements = [
    { title: "First Plank", description: "Complete your first plank exercise", unlocked: false },
    { title: "Week Warrior", description: "Complete 7 days in a row", unlocked: false },
    { title: "Minute Master", description: "Hold a plank for 1 full minute", unlocked: false },
    { title: "Consistency King", description: "Complete 30 days in a row", unlocked: false }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Progress</h2>
        <p className="text-gray-600">Track your plank journey</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-orange-100">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">0:00</p>
              <p className="text-sm text-blue-100">Total Time</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Progress */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weeklyData.map((day, index) => (
                <div key={day.day} className="text-center">
                  <p className="text-xs text-gray-600 mb-2">{day.day}</p>
                  <div
                    className={`w-8 h-8 rounded-full border-2 mx-auto ${
                      day.completed
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 bg-gray-100"
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">0/7 days completed this week</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.title}
                className={`flex items-center p-3 rounded-lg border ${
                  achievement.unlocked
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    achievement.unlocked ? "bg-yellow-500" : "bg-gray-300"
                  }`}
                />
                <div className="flex-1">
                  <p className={`font-medium ${achievement.unlocked ? "text-gray-800" : "text-gray-500"}`}>
                    {achievement.title}
                  </p>
                  <p className={`text-sm ${achievement.unlocked ? "text-gray-600" : "text-gray-400"}`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StatsTab;
