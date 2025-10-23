import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TimePickerModalProps {
  isOpen: boolean;
  currentMinutes: number;
  currentSeconds: number;
  onSave: (minutes: number, seconds: number) => void;
  onClose: () => void;
}

const TimePickerModal = ({ isOpen, currentMinutes, currentSeconds, onSave, onClose }: TimePickerModalProps) => {
  const [selectedMinutes, setSelectedMinutes] = useState(currentMinutes);
  const [selectedSeconds, setSelectedSeconds] = useState(currentSeconds);
  const minutesRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef<HTMLDivElement>(null);

  // Reset to current time when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMinutes(currentMinutes);
      setSelectedSeconds(currentSeconds);
    }
  }, [isOpen, currentMinutes, currentSeconds]);

  // Scroll to selected values when modal opens
  useEffect(() => {
    if (isOpen && minutesRef.current && secondsRef.current) {
      const minuteItem = minutesRef.current.children[selectedMinutes] as HTMLElement;
      const secondItem = secondsRef.current.children[selectedSeconds] as HTMLElement;
      
      if (minuteItem) {
        minutesRef.current.scrollTop = minuteItem.offsetTop - minutesRef.current.offsetHeight / 2 + minuteItem.offsetHeight / 2;
      }
      if (secondItem) {
        secondsRef.current.scrollTop = secondItem.offsetTop - secondsRef.current.offsetHeight / 2 + secondItem.offsetHeight / 2;
      }
    }
  }, [isOpen, selectedMinutes, selectedSeconds]);

  const handleSave = () => {
    onSave(selectedMinutes, selectedSeconds);
    onClose();
  };

  const handleMinuteClick = (minute: number) => {
    setSelectedMinutes(minute);
  };

  const handleSecondClick = (second: number) => {
    setSelectedSeconds(second);
  };

  // Generate arrays for minutes (0-99) and seconds (0-59)
  const minutes = Array.from({ length: 100 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Set Timer Duration</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center gap-4 py-6">
          {/* Minutes Wheel */}
          <div className="flex flex-col items-center">
            <div className="text-sm text-muted-foreground mb-2">Minutes</div>
            <div
              ref={minutesRef}
              className="h-48 w-20 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent snap-y snap-mandatory"
              style={{ scrollbarWidth: 'thin' }}
            >
              {/* Top padding */}
              <div className="h-20" />
              
              {minutes.map((minute) => (
                <motion.div
                  key={minute}
                  onClick={() => handleMinuteClick(minute)}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    h-12 flex items-center justify-center cursor-pointer snap-center
                    transition-all duration-200
                    ${selectedMinutes === minute 
                      ? 'text-2xl font-bold text-primary scale-110' 
                      : 'text-lg text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {minute.toString().padStart(2, '0')}
                </motion.div>
              ))}
              
              {/* Bottom padding */}
              <div className="h-20" />
            </div>
          </div>

          {/* Separator */}
          <div className="text-3xl font-bold text-primary pb-6">:</div>

          {/* Seconds Wheel */}
          <div className="flex flex-col items-center">
            <div className="text-sm text-muted-foreground mb-2">Seconds</div>
            <div
              ref={secondsRef}
              className="h-48 w-20 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent snap-y snap-mandatory"
              style={{ scrollbarWidth: 'thin' }}
            >
              {/* Top padding */}
              <div className="h-20" />
              
              {seconds.map((second) => (
                <motion.div
                  key={second}
                  onClick={() => handleSecondClick(second)}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    h-12 flex items-center justify-center cursor-pointer snap-center
                    transition-all duration-200
                    ${selectedSeconds === second 
                      ? 'text-2xl font-bold text-primary scale-110' 
                      : 'text-lg text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {second.toString().padStart(2, '0')}
                </motion.div>
              ))}
              
              {/* Bottom padding */}
              <div className="h-20" />
            </div>
          </div>
        </div>

        {/* Selected Time Display */}
        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground mb-1">Selected Time</div>
          <div className="text-3xl font-bold text-primary">
            {selectedMinutes.toString().padStart(2, '0')}:{selectedSeconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Set Time
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimePickerModal;
