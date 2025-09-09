
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type CountdownTimerState = 'setup' | 'ready' | 'running' | 'paused' | 'completed';

interface CircularProgressTimerProps {
  timeLeft: number;
  duration: number;
  state: CountdownTimerState;
  progress: number;
}

const CircularProgressTimer = ({ timeLeft, duration, state, progress }: CircularProgressTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    // State-based colors take priority
    if (state === 'completed') return { ring: 'stroke-green-500', bg: 'from-green-500 to-emerald-500' };
    if (state === 'paused') return { ring: 'stroke-muted-foreground', bg: 'from-muted to-muted-foreground' };
    
    // For setup and ready states, always use primary blue regardless of duration
    if (state === 'setup' || state === 'ready') {
      return { ring: 'stroke-primary', bg: 'from-primary to-blue-600' };
    }
    
    // For running state, check time-based warnings
    if (state === 'running') {
      if (timeLeft <= 10) return { ring: 'stroke-destructive', bg: 'from-destructive to-red-600' };
      if (timeLeft <= 30) return { ring: 'stroke-yellow-500', bg: 'from-yellow-500 to-amber-500' };
    }
    
    // Default primary color
    return { ring: 'stroke-primary', bg: 'from-primary to-blue-600' };
  };

  const getStateMessage = () => {
    switch (state) {
      case 'setup': return '';
      case 'ready': return 'Ready to Start';
      case 'running': return timeLeft <= 10 ? 'Almost There!' : 'Keep Going!';
      case 'paused': return 'Paused';
      case 'completed': return 'Completed!';
      default: return '';
    }
  };

  const colors = getStateColor();
  
  // Responsive SVG configuration
  const svgConfig = {
    mobile: { 
      size: 200, 
      radius: 80, 
      strokeWidth: 6,
      center: 100 
    },
    desktop: { 
      size: 280, 
      radius: 120, 
      strokeWidth: 8,
      center: 140 
    }
  };

  // Calculate progress for both sizes
  const mobileCircumference = 2 * Math.PI * svgConfig.mobile.radius;
  const desktopCircumference = 2 * Math.PI * svgConfig.desktop.radius;
  const remainingProgress = 100 - progress;

  return (
    <Card className={`bg-gradient-to-br ${colors.bg} text-white border-0 shadow-lg w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] flex items-center justify-center`}>
      <div className="relative">
        {/* Mobile SVG */}
        <svg 
          width={svgConfig.mobile.size} 
          height={svgConfig.mobile.size} 
          className="sm:hidden transform rotate-90 scale-x-[-1]"
          viewBox={`0 0 ${svgConfig.mobile.size} ${svgConfig.mobile.size}`}
        >
          {/* Background Circle */}
          <circle
            cx={svgConfig.mobile.center}
            cy={svgConfig.mobile.center}
            r={svgConfig.mobile.radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={svgConfig.mobile.strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={svgConfig.mobile.center}
            cy={svgConfig.mobile.center}
            r={svgConfig.mobile.radius}
            stroke="white"
            strokeWidth={svgConfig.mobile.strokeWidth}
            fill="none"
            strokeDasharray={mobileCircumference}
            strokeDashoffset={mobileCircumference * (remainingProgress / 100)}
            strokeLinecap="round"
            initial={{ strokeDashoffset: mobileCircumference }}
            animate={{ strokeDashoffset: mobileCircumference * (remainingProgress / 100) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>

        {/* Desktop SVG */}
        <svg 
          width={svgConfig.desktop.size} 
          height={svgConfig.desktop.size} 
          className="hidden sm:block transform rotate-90 scale-x-[-1]"
          viewBox={`0 0 ${svgConfig.desktop.size} ${svgConfig.desktop.size}`}
        >
          {/* Background Circle */}
          <circle
            cx={svgConfig.desktop.center}
            cy={svgConfig.desktop.center}
            r={svgConfig.desktop.radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={svgConfig.desktop.strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={svgConfig.desktop.center}
            cy={svgConfig.desktop.center}
            r={svgConfig.desktop.radius}
            stroke="white"
            strokeWidth={svgConfig.desktop.strokeWidth}
            fill="none"
            strokeDasharray={desktopCircumference}
            strokeDashoffset={desktopCircumference * (remainingProgress / 100)}
            strokeLinecap="round"
            initial={{ strokeDashoffset: desktopCircumference }}
            animate={{ strokeDashoffset: desktopCircumference * (remainingProgress / 100) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Timer Display - Absolutely centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-2xl sm:text-4xl font-bold"
          >
            {formatTime(timeLeft)}
          </motion.div>
          
          {/* State Message */}
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-sm sm:text-base font-semibold mt-2"
          >
            {getStateMessage()}
          </motion.div>

          {/* Warning for low time */}
          {state === 'running' && timeLeft <= 10 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-1 text-xs sm:text-sm font-medium"
            >
              🔥 Final countdown!
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CircularProgressTimer;
