
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Trophy, Clock, Target, Star } from 'lucide-react';
import { format } from 'date-fns';

type TournamentCardProps = {
  tournament: {
    id: string;
    title: string;
    description?: string | null;
    tournament_type: string;
    status?: string | null;
    registration_start: string;
    registration_end: string;
    tournament_start: string;
    tournament_end: string;
    max_participants?: number | null;
    current_participants?: number | null;
    bracket_size: number;
    prize_pool?: any;
    registered: boolean;
    registration?: {
      seed_position?: number | null;
      current_round: number;
      is_eliminated: boolean;
      total_score: number;
    } | null;
  };
  onRegister: (tournamentId: string) => void;
  onViewBracket?: (tournamentId: string) => void;
};

const TournamentCard = ({ tournament, onRegister, onViewBracket }: TournamentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration': return 'Registration Open';
      case 'active': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Upcoming';
    }
  };

  const isRegistrationOpen = tournament.status === 'registration';
  const isTournamentFull = tournament.max_participants && tournament.current_participants >= tournament.max_participants;
  const registrationDaysLeft = Math.ceil((new Date(tournament.registration_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {/* Tournament Type Indicator */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-orange-500" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{tournament.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {tournament.tournament_type}
                </Badge>
                <Badge 
                  className={`text-xs text-white ${getStatusColor(tournament.status || 'upcoming')}`}
                >
                  {getStatusText(tournament.status || 'upcoming')}
                </Badge>
              </div>
            </div>
          </div>
          
          {tournament.registered && (
            <div className="flex flex-col items-end gap-1">
              <Badge variant="default" className="bg-green-500 text-white">
                {tournament.registration?.is_eliminated ? 'Eliminated' : 'Registered'}
              </Badge>
              {tournament.registration?.seed_position && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Target className="w-3 h-3" />
                  <span>Seed #{tournament.registration.seed_position}</span>
                </div>
              )}
              {tournament.registration?.total_score > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{tournament.registration.total_score} pts</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {tournament.description && (
          <CardDescription className="mt-2">{tournament.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tournament Progress (if registered and active) */}
        {tournament.registered && tournament.status === 'active' && tournament.registration && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800">Tournament Progress</span>
              <Badge variant="secondary" className="text-xs">
                Round {tournament.registration.current_round}
              </Badge>
            </div>
            {tournament.registration.is_eliminated ? (
              <div className="text-sm text-red-600">Eliminated in Round {tournament.registration.current_round}</div>
            ) : (
              <div className="text-sm text-green-600">Still competing!</div>
            )}
          </div>
        )}

        {/* Tournament Details */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Registration: {format(new Date(tournament.registration_start), 'MMM d')} - {format(new Date(tournament.registration_end), 'MMM d')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Trophy className="w-4 h-4" />
            <span>
              Tournament: {format(new Date(tournament.tournament_start), 'MMM d')} - {format(new Date(tournament.tournament_end), 'MMM d')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {tournament.current_participants || 0} / {tournament.max_participants} registered
            </span>
          </div>

          {isRegistrationOpen && registrationDaysLeft > 0 && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-4 h-4" />
              <span>{registrationDaysLeft} days left to register</span>
            </div>
          )}
        </div>

        {/* Prize Pool Preview */}
        {tournament.prize_pool && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
            <Trophy className="w-4 h-4" />
            <span>Prize pool available</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!tournament.registered && isRegistrationOpen ? (
            <Button 
              onClick={() => onRegister(tournament.id)}
              className="flex-1"
              disabled={isTournamentFull}
            >
              {isTournamentFull ? 'Tournament Full' : 'Register'}
            </Button>
          ) : tournament.registered ? (
            <Button variant="outline" className="flex-1" disabled>
              {tournament.registration?.is_eliminated ? '✓ Participated' : '✓ Registered'}
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              Registration Closed
            </Button>
          )}
          
          {onViewBracket && tournament.status !== 'upcoming' && (
            <Button 
              variant="outline" 
              onClick={() => onViewBracket(tournament.id)}
              className="px-3"
            >
              Bracket
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;
