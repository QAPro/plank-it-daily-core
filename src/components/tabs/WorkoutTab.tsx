
import { motion } from "framer-motion";
import { Play, Clock, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const WorkoutTab = () => {
  const exercises = [
    {
      name: "Basic Plank",
      difficulty: 1,
      duration: "1-2 minutes",
      description: "Perfect for beginners to build foundational core strength",
      color: "from-green-400 to-green-500"
    },
    {
      name: "Extended Plank",
      difficulty: 2,
      duration: "2-3 minutes",
      description: "Hold longer to challenge your endurance",
      color: "from-blue-400 to-blue-500"
    },
    {
      name: "Side Plank",
      difficulty: 3,
      duration: "1-2 minutes each side",
      description: "Target your obliques and improve balance",
      color: "from-purple-400 to-purple-500"
    },
    {
      name: "Plank to Push-up",
      difficulty: 4,
      duration: "3-5 minutes",
      description: "Dynamic movement combining plank and push-up",
      color: "from-orange-400 to-orange-500"
    }
  ];

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < level ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Workout</h2>
        <p className="text-gray-600">Select a plank exercise to get started</p>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.name}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100 overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${exercise.color} p-4 text-white`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{exercise.name}</h3>
                    <div className="flex space-x-1">
                      {getDifficultyStars(exercise.difficulty)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {exercise.duration}
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      Level {exercise.difficulty}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-4">{exercise.description}</p>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2 rounded-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Exercise
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Start */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-0">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Quick 5-Minute Session</h3>
            <p className="text-gray-300 mb-4">Not sure what to choose? Start with our recommended daily routine</p>
            <Button className="bg-white text-gray-800 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg">
              <Play className="w-4 h-4 mr-2" />
              Quick Start
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutTab;
