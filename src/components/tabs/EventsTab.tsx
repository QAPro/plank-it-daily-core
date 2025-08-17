
import React from 'react';
import { useSeasonalEvents } from '@/hooks/useSeasonalEvents';
import { Calendar } from 'lucide-react';
import SeasonalEventCard from '@/components/events/SeasonalEventCard';

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <SeasonalEventCard
              key={event.id}
              event={event}
              onJoin={joinEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsTab;
