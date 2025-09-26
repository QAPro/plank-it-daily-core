
import React from 'react';
import { useLeagues } from '@/hooks/useLeagues';
import { useTournaments } from '@/hooks/useTournaments';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, Star } from 'lucide-react';
import LeagueOverview from '@/components/leagues/LeagueOverview';
import TournamentCard from '@/components/tournaments/TournamentCard';
import FlagGuard from '@/components/access/FlagGuard';

const CompeteTab = () => {
  const { leagues, loading: leaguesLoading, joinLeague } = useLeagues();
  const { tournaments, loading: tournamentsLoading, register } = useTournaments();

  // Find user's active league
  const activeLeague = leagues.find(league => league.joined);

  return (
    <FlagGuard featureName="competition_features">
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
          {/* Active League Overview */}
          {activeLeague && (
            <LeagueOverview league={activeLeague} />
          )}

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
                <div key={league.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{league.name}</h3>
                      {league.description && (
                        <p className="text-gray-600 text-sm mt-1">{league.description}</p>
                      )}
                    </div>
                    {league.joined && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Joined
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Trophy className="w-4 h-4" />
                    <span>{league.divisions.length} divisions available</span>
                  </div>

                  {!league.joined ? (
                    <button 
                      onClick={() => joinLeague(league.id)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Join League
                    </button>
                  ) : (
                    <div className="text-center py-2 text-blue-600 font-medium">
                      ✓ You're competing!
                    </div>
                  )}
                </div>
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
            <div className="grid gap-6 md:grid-cols-2">
              {tournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={{
                    ...tournament,
                    tournament_type: 'elimination', // Default tournament type
                    bracket_size: 64, // Default bracket size
                    registration: tournament.registered ? {
                      seed_position: tournament.registration?.seed_position || null,
                      current_round: tournament.registration?.current_round || 1,
                      is_eliminated: tournament.registration?.is_eliminated || false,
                      total_score: tournament.registration?.total_score || 0
                    } : null
                  }}
                  onRegister={register}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </FlagGuard>
  );
};

export default CompeteTab;
