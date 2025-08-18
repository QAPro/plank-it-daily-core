
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Plus, 
  Trophy, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  target_date: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

const GoalTrackingDashboard = () => {
  const { user } = useAuth();
  const [selectedGoalType, setSelectedGoalType] = useState<string>('all');

  const { data: goals, isLoading } = useQuery({
    queryKey: ['user-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const getDaysUntilDeadline = (targetDate: string) => {
    const today = new Date();
    const deadline = new Date(targetDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalStatus = (goal: Goal) => {
    const progress = calculateProgress(goal.current_value, goal.target_value);
    const daysLeft = getDaysUntilDeadline(goal.target_date);
    
    if (progress >= 100) return { status: 'completed', color: 'bg-green-500' };
    if (daysLeft < 0) return { status: 'overdue', color: 'bg-red-500' };
    if (daysLeft <= 3) return { status: 'urgent', color: 'bg-orange-500' };
    return { status: 'active', color: 'bg-blue-500' };
  };

  const formatGoalValue = (value: number, type: string) => {
    if (type === 'duration') {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return value.toString();
  };

  const activeGoals = goals?.filter(goal => goal.is_active) || [];
  const completedGoals = goals?.filter(goal => !goal.is_active && calculateProgress(goal.current_value, goal.target_value) >= 100) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Goal Tracking</h2>
          <p className="text-gray-600">Track your fitness goals and celebrate achievements</p>
        </div>
        
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{activeGoals.length}</p>
            <p className="text-sm text-gray-600">Active Goals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{completedGoals.length}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">
              {activeGoals.length > 0 
                ? Math.round(activeGoals.reduce((acc, goal) => acc + calculateProgress(goal.current_value, goal.target_value), 0) / activeGoals.length)
                : 0}%
            </p>
            <p className="text-sm text-gray-600">Avg Progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">
              {activeGoals.filter(goal => getDaysUntilDeadline(goal.target_date) <= 7).length}
            </p>
            <p className="text-sm text-gray-600">Due This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Goal Filters */}
      <div className="flex gap-2">
        {['all', 'duration', 'consistency', 'strength'].map((type) => (
          <Button
            key={type}
            variant={selectedGoalType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedGoalType(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals
              .filter(goal => selectedGoalType === 'all' || goal.goal_type === selectedGoalType)
              .map((goal, index) => {
                const progress = calculateProgress(goal.current_value, goal.target_value);
                const daysLeft = getDaysUntilDeadline(goal.target_date);
                const { status, color } = getGoalStatus(goal);

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{goal.description}</CardTitle>
                            <Badge variant="outline" className="mt-1 capitalize">
                              {goal.goal_type}
                            </Badge>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{formatGoalValue(goal.current_value, goal.goal_type)} / {formatGoalValue(goal.target_value, goal.goal_type)}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-sm text-gray-600 mt-1">{progress.toFixed(1)}% complete</p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className={daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-orange-600' : 'text-gray-600'}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : 
                               daysLeft === 0 ? 'Due today' :
                               daysLeft === 1 ? 'Due tomorrow' :
                               `${daysLeft} days left`}
                            </span>
                          </div>
                          {status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          disabled={status === 'completed'}
                        >
                          {status === 'completed' ? 'Completed!' : 'Update Progress'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Goals</h3>
          <p className="text-gray-600 mb-4">
            Set your first fitness goal to start tracking your progress
          </p>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </Button>
        </Card>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recently Completed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {completedGoals.slice(0, 4).map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <p className="font-medium text-green-800">{goal.description}</p>
                    <p className="text-sm text-green-600">
                      {formatGoalValue(goal.target_value, goal.goal_type)} achieved!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTrackingDashboard;
