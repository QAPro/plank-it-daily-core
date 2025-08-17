
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, Trophy, Target, Star } from 'lucide-react';
import { format } from 'date-fns';

type SeasonalEventCardProps = {
  event: {
    id: string;
    title: string;
    description?: string | null;
    event_type: string;
    start_date: string;
    end_date: string;
    max_participants?: number | null;
    current_participants?: number | null;
    reward_data?: any;
    joined: boolean;
    participant?: {
      progress_data?: any;
      is_completed: boolean;
      final_score?: number | null;
    } | null;
  };
  onJoin: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
};

const SeasonalEventCard = ({ event, onJoin, onViewDetails }: SeasonalEventCardProps) => {
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'challenge': return Target;
      case 'tournament': return Trophy;
      case 'community': return Users;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'challenge': return 'bg-orange-500';
      case 'tournament': return 'bg-purple-500';
      case 'community': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const EventIcon = getEventTypeIcon(event.event_type);
  const progressPercentage = event.participant?.progress_data?.percentage || 0;
  const isEventFull = event.max_participants && event.current_participants >= event.max_participants;
  const daysLeft = Math.ceil((new Date(event.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Type Indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full ${getEventTypeColor(event.event_type)}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getEventTypeColor(event.event_type)} bg-opacity-10`}>
              <EventIcon className={`w-5 h-5 text-${getEventTypeColor(event.event_type).replace('bg-', '')}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {event.event_type}
                </Badge>
                {daysLeft > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    {daysLeft} days left
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Ended
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {event.joined && (
            <div className="flex flex-col items-end gap-1">
              <Badge variant="default" className="bg-green-500 text-white">
                {event.participant?.is_completed ? 'Completed' : 'Joined'}
              </Badge>
              {event.participant?.is_completed && event.participant.final_score && (
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{event.participant.final_score} pts</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {event.description && (
          <CardDescription className="mt-2">{event.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event Progress (if joined) */}
        {event.joined && !event.participant?.is_completed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(event.start_date), 'MMM d')} - {format(new Date(event.end_date), 'MMM d')}</span>
          </div>
          
          {event.max_participants && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{event.current_participants || 0} / {event.max_participants}</span>
            </div>
          )}
        </div>

        {/* Rewards Preview */}
        {event.reward_data && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
            <Trophy className="w-4 h-4" />
            <span>Exclusive rewards available</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {!event.joined ? (
            <Button 
              onClick={() => onJoin(event.id)}
              className="flex-1"
              disabled={isEventFull || daysLeft <= 0}
            >
              {isEventFull ? 'Event Full' : daysLeft <= 0 ? 'Event Ended' : 'Join Event'}
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              {event.participant?.is_completed ? '✓ Completed' : '✓ Participating'}
            </Button>
          )}
          
          {onViewDetails && (
            <Button 
              variant="outline" 
              onClick={() => onViewDetails(event.id)}
              className="px-3"
            >
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonalEventCard;
