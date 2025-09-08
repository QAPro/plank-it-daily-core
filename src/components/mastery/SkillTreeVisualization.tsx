import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Lock, 
  CheckCircle, 
  Star, 
  Target, 
  TrendingUp, 
  Award,
  Flame
} from 'lucide-react';
import { useExerciseMastery } from '@/hooks/useExerciseMastery';
import { useExercises } from '@/hooks/useExercises';

interface SkillTreeVisualizationProps {
  onExerciseSelect?: (exerciseId: string) => void;
  onCertificationRequest?: (exerciseId: string) => void;
}

const SkillTreeVisualization: React.FC<SkillTreeVisualizationProps> = ({
  onExerciseSelect,
  onCertificationRequest
}) => {
  const { data: exercises } = useExercises();
  const {
    masteries,
    certifications,
    getExerciseMastery,
    getCertification,
    canUnlockExercise,
    getRequiredExercises
  } = useExerciseMastery();

  const getMasteryIcon = (level: number) => {
    if (level >= 9) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (level >= 7) return <Award className="h-4 w-4 text-purple-500" />;
    if (level >= 5) return <Star className="h-4 w-4 text-blue-500" />;
    if (level >= 3) return <Target className="h-4 w-4 text-green-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  const getMasteryColor = (level: number) => {
    if (level >= 9) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (level >= 7) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (level >= 5) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (level >= 3) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getCertificationBadge = (exerciseId: string) => {
    const cert = getCertification(exerciseId);
    if (!cert) return null;

    const colors = {
      bronze: 'bg-amber-600',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500'
    };

    return (
      <Badge className={`${colors[cert.certification_level as keyof typeof colors]} text-white ml-2`}>
        {cert.certification_level.toUpperCase()} CERTIFIED
      </Badge>
    );
  };

  if (!exercises) return <div>Loading...</div>;

  // Group exercises by difficulty level for better visualization
  const groupedExercises = exercises.reduce((acc, exercise) => {
    const level = exercise.difficulty_level || 1;
    if (!acc[level]) acc[level] = [];
    acc[level].push(exercise);
    return acc;
  }, {} as Record<number, typeof exercises>);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Exercise Mastery Skill Tree
        </h2>
        <p className="text-muted-foreground mt-2">
          Master exercises to unlock advanced variations and earn certifications
        </p>
      </div>

      {Object.entries(groupedExercises)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([level, levelExercises]) => (
          <div key={level} className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Level {level}
              </Badge>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levelExercises.map((exercise) => {
                const mastery = getExerciseMastery(exercise.id);
                const certification = getCertification(exercise.id);
                const canUnlock = canUnlockExercise(exercise.id);
                const requirements = getRequiredExercises(exercise.id);
                const masteryLevel = mastery?.mastery_level || 0;
                const overallScore = mastery ? 
                  (mastery.technique_score + mastery.consistency_score + mastery.progression_score) / 3 : 0;

                return (
                  <Card 
                    key={exercise.id}
                    className={`transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden ${
                      !canUnlock ? 'opacity-60' : 'hover:shadow-elegant'
                    }`}
                    onClick={() => canUnlock && onExerciseSelect?.(exercise.id)}
                  >
                    <div className={`absolute inset-0 opacity-10 ${getMasteryColor(masteryLevel)}`} />
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {!canUnlock ? (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          ) : certification ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            getMasteryIcon(masteryLevel)
                          )}
                          <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        </div>
                        {masteryLevel > 0 && (
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-bold">{masteryLevel}</span>
                          </div>
                        )}
                      </div>
                      {getCertificationBadge(exercise.id)}
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {exercise.description}
                      </p>

                      {mastery && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Overall Mastery</span>
                            <span>{Math.round(overallScore)}%</span>
                          </div>
                          <Progress value={overallScore} className="h-2" />

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <div className="text-muted-foreground">Technique</div>
                              <div className="font-medium">{Math.round(mastery.technique_score)}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Consistency</div>
                              <div className="font-medium">{Math.round(mastery.consistency_score)}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Progress</div>
                              <div className="font-medium">{Math.round(mastery.progression_score)}%</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {!canUnlock && requirements.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <div className="font-medium">Requirements:</div>
                          {requirements.map((req, index) => {
                            const reqExercise = exercises.find(e => e.id === req.required_exercise_id);
                            return (
                              <div key={index} className="flex items-center gap-1 mt-1">
                                <Lock className="h-3 w-3" />
                                <span>
                                  {reqExercise?.name} (Level {req.required_mastery_level}+)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {canUnlock && masteryLevel >= 7 && !certification && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCertificationRequest?.(exercise.id);
                          }}
                        >
                          Request Certification
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};

export default SkillTreeVisualization;