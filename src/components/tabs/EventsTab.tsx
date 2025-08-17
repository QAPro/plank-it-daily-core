
import React from 'react';
import { useSeasonalEvents } from '@/hooks/useSeasonalEvents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Trophy } from 'lucide-react';
import { format } from 'date-fns';

const EventsTab = () => {
  const { events, loading, joinEvent } = useSeasonalEvents();

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-600">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Seasonal Events</h1>
        <p className="text-gray-600">Join special challenges and seasonal activities!</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Events</h3>
          <p className="text-gray-500">Check back soon for new seasonal events and challenges!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge 
                      variant={event.event_type === 'challenge' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {event.event_type}
                    </Badge>
                  </div>
                  {event.joined && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Joined
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <CardDescription className="mt-2">{event.description}</CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(event.start_date), 'MMM d')} - {format(new Date(event.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
                
                {event.max_participants && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.current_participants || 0} / {event.max_participants} participants
                    </span>
                  </div>
                )}

                {event.reward_data && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Trophy className="w-4 h-4" />
                    <span>Rewards available</span>
                  </div>
                )}

                {!event.joined ? (
                  <Button 
                    onClick={() => joinEvent(event.id)}
                    className="w-full mt-4"
                    disabled={event.max_participants && event.current_participants >= event.max_participants}
                  >
                    {event.max_participants && event.current_participants >= event.max_participants 
                      ? 'Event Full' 
                      : 'Join Event'
                    }
                  </Button>
                ) : (
                  <div className="text-center py-2 text-green-600 font-medium">
                    ✓ You're participating!
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsTab;
