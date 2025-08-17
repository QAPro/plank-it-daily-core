
import React, { useState } from 'react';
import { useLeagues } from '@/hooks/useLeagues';
import { useTournaments } from '@/hooks/useTournaments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Users, Star, Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';

const CompeteTab = () => {
  const { leagues, loading: leaguesLoading, joinLeague } = useLeagues();
  const { tournaments, loading: tournamentsLoading, register } = useTournaments();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Competition</h1>
        <p className="text-gray-600">Join leagues and tournaments to compete with other athletes!</p>
      </div>

      <Tabs defaultValue="leagues" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leagues">Leagues</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
        </TabsList>

        <TabsContent value="leagues" className="mt-6">
          {leaguesLoading ? (
            <div className="text-center text-gray-600">Loading leagues...</div>
          ) : leagues.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Leagues</h3>
              <p className="text-gray-500">Check back soon for new leagues to join!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {leagues.map((league) => (
                <Card key={league.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{league.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {league.league_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {league.joined && (
                        <Badge variant="default" className="bg-blue-500">
                          Joined
                        </Badge>
                      )}
                    </div>
                    {league.description && (
                      <CardDescription className="mt-2">{league.description}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>{league.divisions.length} divisions available</span>
                    </div>

                    {league.participant && (
                      <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">Your Stats</div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                          <div>Rating: {league.participant.current_rating}</div>
                          <div>Matches: {league.participant.matches_played}</div>
                        </div>
                      </div>
                    )}

                    {!league.joined ? (
                      <Button 
                        onClick={() => joinLeague(league.id)}
                        className="w-full mt-4"
                      >
                        Join League
                      </Button>
                    ) : (
                      <div className="text-center py-2 text-blue-600 font-medium">
                        ✓ You're competing!
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tournaments" className="mt-6">
          {tournamentsLoading ? (
            <div className="text-center text-gray-600">Loading tournaments...</div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Tournaments</h3>
              <p className="text-gray-500">Check back soon for new tournaments!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tournament.title}</CardTitle>
                        <Badge 
                          variant={tournament.status === 'registration' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {tournament.status}
                        </Badge>
                      </div>
                      {tournament.registered && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Registered
                        </Badge>
                      )}
                    </div>
                    {tournament.description && (
                      <CardDescription className="mt-2">{tournament.description}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Registration: {format(new Date(tournament.registration_start), 'MMM d')} - {format(new Date(tournament.registration_end), 'MMM d')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {tournament.current_participants || 0} / {tournament.max_participants} registered
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Trophy className="w-4 h-4" />
                      <span>Tournament: {format(new Date(tournament.tournament_start), 'MMM d')} - {format(new Date(tournament.tournament_end), 'MMM d')}</span>
                    </div>

                    {!tournament.registered && tournament.status === 'registration' ? (
                      <Button 
                        onClick={() => register(tournament.id)}
                        className="w-full mt-4"
                        disabled={tournament.current_participants >= tournament.max_participants}
                      >
                        {tournament.current_participants >= tournament.max_participants 
                          ? 'Tournament Full' 
                          : 'Register'
                        }
                      </Button>
                    ) : tournament.registered ? (
                      <div className="text-center py-2 text-green-600 font-medium">
                        ✓ You're registered!
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-500">
                        Registration closed
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompeteTab;
