import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TreePine, 
  Award, 
  Users, 
  TrendingUp, 
  Target,
  BookOpen,
  Trophy,
  Star,
  Zap
} from 'lucide-react';
import SkillTreeVisualization from '@/components/mastery/SkillTreeVisualization';
import CertificationProgress from '@/components/mastery/CertificationProgress';
import TechniqueValidation from '@/components/mastery/TechniqueValidation';
import { useExerciseMastery } from '@/hooks/useExerciseMastery';
import { useStatusTracks } from '@/hooks/useStatusTracks';
import AdvancedFeatureGuard from '@/components/access/AdvancedFeatureGuard';

const ExerciseMasteryHub: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('skill-tree');

  const { 
    masteries, 
    certifications, 
    getTotalMasteryScore,
    requestCertification,
    isRequestingCertification
  } = useExerciseMastery();

  const { getTotalExperience, getHighestLevelTrack } = useStatusTracks();

  const totalMasteryScore = getTotalMasteryScore();
  const totalExperience = getTotalExperience();
  const highestTrack = getHighestLevelTrack();
  const approvedCertifications = certifications.filter(c => c.status === 'approved');

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExercise(exerciseId);
    setActiveTab('validation');
  };

  const handleCertificationRequest = (exerciseId: string) => {
    requestCertification({
      exerciseId,
      certificationLevel: 'bronze',
      evidenceUrls: []
    });
  };

  const canValidateOthers = highestTrack && highestTrack.track_level >= 5 && totalMasteryScore >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-primary to-primary-glow rounded-full">
              <TreePine className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Exercise Mastery Hub
              </h1>
              <p className="text-muted-foreground text-lg">
                Master exercises, earn certifications, and unlock advanced techniques
              </p>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{Math.round(totalMasteryScore)}</div>
                <div className="text-sm text-muted-foreground">Avg Mastery</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{approvedCertifications.length}</div>
                <div className="text-sm text-muted-foreground">Certifications</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{masteries.length}</div>
                <div className="text-sm text-muted-foreground">Skills Tracked</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalExperience}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <AdvancedFeatureGuard feature="exercise_mastery">
          <Card className="border-0 shadow-elegant">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="border-b">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                  <TabsTrigger value="skill-tree" className="flex items-center gap-2">
                    <TreePine className="h-4 w-4" />
                    Skill Tree
                  </TabsTrigger>
                  <TabsTrigger value="certifications" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Certifications
                  </TabsTrigger>
                  <TabsTrigger value="validation" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Validation
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Progress
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-6">
                <TabsContent value="skill-tree" className="mt-0">
                  <SkillTreeVisualization
                    onExerciseSelect={handleExerciseSelect}
                    onCertificationRequest={handleCertificationRequest}
                  />
                </TabsContent>

                <TabsContent value="certifications" className="mt-0">
                  <CertificationProgress
                    onUploadEvidence={(certId) => console.log('Upload evidence for', certId)}
                    onViewCertification={(certId) => console.log('View certification', certId)}
                  />
                </TabsContent>

                <TabsContent value="validation" className="mt-0">
                  {selectedExercise ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Technique Validation</h3>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedExercise(null)}
                        >
                          Back to Overview
                        </Button>
                      </div>
                      <TechniqueValidation
                        exerciseId={selectedExercise}
                        canValidate={canValidateOthers}
                        onRequestValidation={() => console.log('Request validation')}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Select an Exercise</h3>
                      <p className="text-muted-foreground mb-4">
                        Choose an exercise from the skill tree to view validation options
                      </p>
                      <Button onClick={() => setActiveTab('skill-tree')}>
                        <TreePine className="h-4 w-4 mr-2" />
                        Browse Skill Tree
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="progress" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mastery Progress */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          Mastery Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {masteries.slice(0, 5).map((mastery) => (
                          <div key={mastery.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">Exercise {mastery.exercise_id.slice(0, 8)}...</span>
                                <Badge variant="outline">Level {mastery.mastery_level}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>Tech: {Math.round(mastery.technique_score)}%</div>
                                <div>Cons: {Math.round(mastery.consistency_score)}%</div>
                                <div>Prog: {Math.round(mastery.progression_score)}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {masteries.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground">
                            Start practicing exercises to see your mastery progress
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Achievement Milestones */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-500" />
                          Achievement Milestones
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">First Certification</span>
                            </div>
                            <Badge variant={approvedCertifications.length > 0 ? "default" : "secondary"}>
                              {approvedCertifications.length > 0 ? "Achieved" : "Pending"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Master Level (Avg 7+)</span>
                            </div>
                            <Badge variant={totalMasteryScore >= 7 ? "default" : "secondary"}>
                              {totalMasteryScore >= 7 ? "Achieved" : `${Math.round(totalMasteryScore)}/7`}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium">Technique Validator</span>
                            </div>
                            <Badge variant={canValidateOthers ? "default" : "secondary"}>
                              {canValidateOthers ? "Unlocked" : "Locked"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </AdvancedFeatureGuard>
      </div>
    </div>
  );
};

export default ExerciseMasteryHub;