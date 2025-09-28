import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Calendar, Trophy, Share2, Eye, EyeOff } from 'lucide-react';
import { useVictoryPhotos } from '@/hooks/useVictoryPhotos';
import { motion, AnimatePresence } from 'framer-motion';

const VictoryGallery: React.FC = () => {
  const { victoryPhotos, loading } = useVictoryPhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2 text-primary" />
            Your Victory Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (victoryPhotos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2 text-primary" />
            Your Victory Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start Your Success Story!</h3>
          <p className="text-muted-foreground mb-6">
            Capture your transformation journey and celebrate every victory along the way!
          </p>
          <Button>
            <Camera className="w-4 h-4 mr-2" />
            Add Your First Victory Photo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="w-5 h-5 mr-2 text-primary" />
            Your Victory Gallery
          </div>
          <Badge variant="secondary">{victoryPhotos.length} Victory Moments</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {victoryPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedPhoto(photo.id)}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  <img
                    src={photo.photo_url}
                    alt={photo.victory_title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Victory Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <h4 className="text-white font-semibold text-sm truncate">
                      {photo.victory_title}
                    </h4>
                    {photo.milestone_achieved && (
                      <div className="flex items-center mt-1">
                        <Trophy className="w-3 h-3 text-yellow-400 mr-1" />
                        <span className="text-yellow-400 text-xs">
                          {photo.milestone_achieved}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Privacy Indicator */}
                  <div className="absolute top-2 right-2">
                    {photo.is_public ? (
                      <Eye className="w-4 h-4 text-white/80" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-white/80" />
                    )}
                  </div>

                  {/* Date */}
                  <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 text-white/80 mr-1" />
                      <span className="text-white/80 text-xs">
                        {new Date(photo.celebration_timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add New Photo Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: victoryPhotos.length * 0.1 + 0.3 }}
          className="mt-6 text-center"
        >
          <Button variant="outline" size="lg">
            <Camera className="w-4 h-4 mr-2" />
            Capture Another Victory
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default VictoryGallery;