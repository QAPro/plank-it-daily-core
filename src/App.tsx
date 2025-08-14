import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HomeTab } from '@/components/tabs/HomeTab';
import { WorkoutTab } from '@/components/tabs/WorkoutTab';
import { StatsTab } from '@/components/tabs/StatsTab';
import { AchievementsTab } from '@/components/tabs/AchievementsTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { Auth } from '@/pages/Auth';
import { EmailVerify } from '@/pages/EmailVerify';
import { ProductionReadinessCheck } from '@/pages/ProductionReadinessCheck';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from 'react-error-boundary'
import { LevelProgressionProvider } from '@/components/level/LevelProgressionProvider';
import { StreakProvider } from '@/contexts/StreakContext';
import { Users, User, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import FriendsTab from './components/tabs/FriendsTab';
import { useLevelProgressionContext } from './components/level/LevelProgressionProvider';

function App() {
  const [activeTab, setActiveTab] = useState("home");
  
  const { isFeatureUnlocked } = useLevelProgressionContext();
  const isFriendsUnlocked = isFeatureUnlocked('friends_system');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<EmailVerify />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <LevelProgressionProvider>
                    <StreakProvider>
                      <div className="pb-20">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                          <div className="sticky top-0 z-10 bg-white border-b">
                            <TabsList className={`grid w-full h-16 ${isFriendsUnlocked ? 'grid-cols-5' : 'grid-cols-4'}`}>
                              <TabsTrigger value="home" className="flex flex-col items-center justify-center h-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home w-5 h-5 mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                <span className="text-xs">Home</span>
                              </TabsTrigger>

                              <TabsTrigger value="workout" className="flex flex-col items-center justify-center h-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame w-5 h-5 mb-1"><path d="M8.5 14.5A2.5 2.5 0 0 0 6 12c0-2.2 4-6 7-6s6 3 6 5c0 1.5-1 1.5-2.5 3.5-1.5 2-2.5 2-2.5 3.5 0 1.5 1 1.5 2.5 3.5 1.5 2 2.5 2 2.5 3.5 0 1.5-1 1.5-2.5 3.5-1.5 2-2.5 2-2.5 3.5 0 1.5 1 1.5 2.5 3.5"/><path d="M15 5h-.5c-1.1 0-2-.9-2-2s.9-2 2-2H15"/></svg>
                                <span className="text-xs">Workout</span>
                              </TabsTrigger>

                              <TabsTrigger value="stats" className="flex flex-col items-center justify-center h-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3 w-5 h-5 mb-1"><path d="M3 3v18h18"/><path d="M7 15v6"/><path d="M11 6v15"/><path d="M15 10v11"/></svg>
                                <span className="text-xs">Stats</span>
                              </TabsTrigger>

                              <TabsTrigger value="achievements" className="flex flex-col items-center justify-center h-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy w-5 h-5 mb-1"><circle cx="12" cy="8" r="5"/><path d="M5 3h14"/><path d="M10 21h4"/><path d="M6 3v7a6 6 0 0 0 12 0V3"/></svg>
                                <span className="text-xs">Achievements</span>
                              </TabsTrigger>
                              
                              {isFriendsUnlocked ? (
                                <TabsTrigger value="friends" className="flex flex-col items-center justify-center h-full">
                                  <Users className="w-5 h-5 mb-1" />
                                  <span className="text-xs">Friends</span>
                                </TabsTrigger>
                              ) : (
                                <TabsTrigger 
                                  value="friends" 
                                  disabled 
                                  className="flex flex-col items-center justify-center h-full opacity-50 cursor-not-allowed"
                                >
                                  <div className="relative">
                                    <Users className="w-5 h-5 mb-1" />
                                    <Lock className="w-3 h-3 absolute -top-1 -right-1 text-gray-400" />
                                  </div>
                                  <span className="text-xs">Level 10</span>
                                </TabsTrigger>
                              )}
                              
                              <TabsTrigger value="profile" className="flex flex-col items-center justify-center h-full">
                                <User className="w-5 h-5 mb-1" />
                                <span className="text-xs">Profile</span>
                              </TabsTrigger>
                            </TabsList>
                          </div>

                          <TabsContent value="home" className="mt-0">
                            <HomeTab />
                          </TabsContent>
                          
                          <TabsContent value="workout" className="mt-0">
                            <WorkoutTab />
                          </TabsContent>
                          
                          <TabsContent value="stats" className="mt-0">
                            <StatsTab />
                          </TabsContent>
                          
                          <TabsContent value="achievements" className="mt-0">
                            <AchievementsTab />
                          </TabsContent>
                          
                          <TabsContent value="friends" className="mt-0">
                            {isFriendsUnlocked ? (
                              <FriendsTab />
                            ) : (
                              <div className="container mx-auto p-4 text-center">
                                <div className="bg-white rounded-lg p-8 shadow-sm">
                                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-gray-400" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Friends Locked</h3>
                                  <p className="text-gray-600 mb-4">
                                    Reach Level 10 to unlock the Friends feature and connect with others!
                                  </p>
                                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                    Unlocks at Level 10
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="profile" className="mt-0">
                            <ProfileTab />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </StreakProvider>
                  </LevelProgressionProvider>
                </ProtectedRoute>
              } 
            />
            <Route path="/production-check" element={<ProductionReadinessCheck />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
