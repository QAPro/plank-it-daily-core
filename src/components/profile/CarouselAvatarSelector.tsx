import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';

interface AvatarOption {
  id: string;
  name: string;
  image_url: string;
  category: string;
  display_order: number;
}

interface CarouselAvatarSelectorProps {
  selectedUrl: string;
  onSelect: (url: string) => void;
  className?: string;
}

const CarouselAvatarSelector = ({ selectedUrl, onSelect, className }: CarouselAvatarSelectorProps) => {
  const [options, setOptions] = useState<AvatarOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    const fetchAvatarOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('avatar_options')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (error) throw error;
        setOptions(data || []);
      } catch (error) {
        console.error('Error fetching avatar options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarOptions();
  }, []);

  // Scroll to selected avatar when carousel is ready
  useEffect(() => {
    if (api && selectedUrl && options.length > 0) {
      const selectedIndex = options.findIndex(opt => opt.image_url === selectedUrl);
      if (selectedIndex !== -1) {
        api.scrollTo(selectedIndex, true);
      }
    }
  }, [api, selectedUrl, options]);

  const handleAvatarClick = useCallback((url: string) => {
    onSelect(url);
  }, [onSelect]);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No avatar options available
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
          slidesToScroll: 1,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4 h-full">
          {options.map((option) => {
            const isSelected = option.image_url === selectedUrl;
            
            return (
              <CarouselItem 
                key={option.id}
                className="pl-2 md:pl-4 basis-auto h-full flex items-center justify-center"
              >
                <button
                  type="button"
                  onClick={() => handleAvatarClick(option.image_url)}
                  className={cn(
                    "relative group h-full w-auto aspect-square max-h-full rounded-full overflow-hidden transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "hover:scale-110 hover:shadow-lg"
                  )}
                  aria-label={`Select ${option.name} avatar`}
                  title={option.name}
                >
                  <img
                    src={option.image_url}
                    alt={option.name}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-fade-in">
                      <div className="bg-primary rounded-full p-2">
                        <Check className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious 
          className="left-0 -translate-x-1/2" 
          variant="outline"
        />
        <CarouselNext 
          className="right-0 translate-x-1/2"
          variant="outline"
        />
      </Carousel>
    </div>
  );
};

export default CarouselAvatarSelector;
