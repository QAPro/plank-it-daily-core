
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type CountdownTimerState = 'setup' | 'ready' | 'running' | 'paused' | 'completed';

interface CircularProgressTimerProps {
  timeLeft: number;
  duration: number;
  state: CountdownTimerState;
  progress: number;
  onClick?: () => void;
}

const CircularProgressTimer = ({ timeLeft, duration, state, progress, onClick }: CircularProgressTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    // State-based colors take priority - returns outer ring and inner circle styles
    if (state === 'completed') {
      return { 
        outerRing: 'bg-gradient-to-br from-green-400 to-emerald-400',
        outerShadow: 'shadow-glow',
        innerCircle: 'bg-gradient-green-timer',
        innerShadow: 'shadow-timer-green'
      };
    }
    if (state === 'paused') {
      return { 
        outerRing: 'bg-gradient-to-br from-gray-400 to-gray-500',
        outerShadow: 'shadow-soft',
        innerCircle: 'bg-gradient-gray-timer',
        innerShadow: 'shadow-timer-gray'
      };
    }
    
    // For running state, check time-based warnings
    if (state === 'running') {
      if (timeLeft <= 10) {
        return { 
          outerRing: 'bg-gradient-to-br from-red-500 to-red-600',
          outerShadow: 'shadow-medium',
          innerCircle: 'bg-gradient-blue-timer',
          innerShadow: 'shadow-timer-blue'
        };
      }
      if (timeLeft <= 30) {
        return { 
          outerRing: 'bg-gradient-to-br from-yellow-500 to-amber-500',
          outerShadow: 'shadow-medium',
          innerCircle: 'bg-gradient-blue-timer',
          innerShadow: 'shadow-timer-blue'
        };
      }
    }
    
    // Default: orange outer ring, blue inner circle
    return { 
      outerRing: 'bg-gradient-orange-ring',
      outerShadow: 'shadow-glow',
      innerCircle: 'bg-gradient-blue-timer',
      innerShadow: 'shadow-timer-blue'
    };
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
      size: 260, 
      radius: 125, 
      strokeWidth: 6,
      center: 130 
    },
    desktop: { 
      size: 340, 
      radius: 165, 
      strokeWidth: 8,
      center: 170 
    }
  };

  // Calculate progress for both sizes
  const mobileCircumference = 2 * Math.PI * svgConfig.mobile.radius;
  const desktopCircumference = 2 * Math.PI * svgConfig.desktop.radius;
  const remainingProgress = 100 - progress;

  return (
    <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] lg:w-[360px] lg:h-[360px] flex items-center justify-center mx-auto">
      {/* Layer 1: Outer Orange Ring Background (z-10) */}
      <motion.div 
        className={`absolute inset-0 rounded-full ${colors.outerRing} ${colors.outerShadow} shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)] z-10 overflow-hidden`}
        animate={state === 'running' ? { scale: [1, 1.02, 1] } : {}}
        transition={state === 'running' ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        {/* Top glossy highlight - simulates light reflection */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[30%] rounded-full bg-gradient-to-b from-white/40 via-white/20 to-transparent blur-sm" />
        {/* Bottom shadow - creates depth */}
        <div className="absolute bottom-0 left-[15%] right-[15%] h-[20%] rounded-full bg-gradient-to-t from-black/30 to-transparent blur-sm" />
      </motion.div>
      
      {/* Layer 2: Progress Rings (z-20) */}
      <div className="absolute inset-[10px] z-20 pointer-events-none">
        {/* Mobile SVG Progress Ring */}
        <svg 
          width={svgConfig.mobile.size} 
          height={svgConfig.mobile.size} 
          className="sm:hidden absolute inset-0 transform rotate-90 scale-x-[-1]"
          viewBox={`0 0 ${svgConfig.mobile.size} ${svgConfig.mobile.size}`}
        >
          {/* Background Ring */}
          <circle
            cx={svgConfig.mobile.center}
            cy={svgConfig.mobile.center}
            r={svgConfig.mobile.radius}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={svgConfig.mobile.strokeWidth}
            fill="none"
          />
          {/* Progress Ring */}
          <motion.circle
            cx={svgConfig.mobile.center}
            cy={svgConfig.mobile.center}
            r={svgConfig.mobile.radius}
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth={svgConfig.mobile.strokeWidth}
            fill="none"
            strokeDasharray={mobileCircumference}
            strokeDashoffset={mobileCircumference * (remainingProgress / 100)}
            strokeLinecap="round"
            filter="drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))"
            initial={{ strokeDashoffset: mobileCircumference }}
            animate={{ strokeDashoffset: mobileCircumference * (remainingProgress / 100) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>

        {/* Desktop SVG Progress Ring */}
        <svg 
          width={svgConfig.desktop.size} 
          height={svgConfig.desktop.size} 
          className="hidden sm:block absolute inset-0 transform rotate-90 scale-x-[-1]"
          viewBox={`0 0 ${svgConfig.desktop.size} ${svgConfig.desktop.size}`}
        >
          {/* Background Ring */}
          <circle
            cx={svgConfig.desktop.center}
            cy={svgConfig.desktop.center}
            r={svgConfig.desktop.radius}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={svgConfig.desktop.strokeWidth}
            fill="none"
          />
          {/* Progress Ring */}
          <motion.circle
            cx={svgConfig.desktop.center}
            cy={svgConfig.desktop.center}
            r={svgConfig.desktop.radius}
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth={svgConfig.desktop.strokeWidth}
            fill="none"
            strokeDasharray={desktopCircumference}
            strokeDashoffset={desktopCircumference * (remainingProgress / 100)}
            strokeLinecap="round"
            filter="drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))"
            initial={{ strokeDashoffset: desktopCircumference }}
            animate={{ strokeDashoffset: desktopCircumference * (remainingProgress / 100) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
      
      {/* Layer 3: Dark Rim/Border Between Rings (z-30) */}
      <div className="absolute inset-[20px] rounded-full bg-gradient-to-br from-background-tertiary to-background-secondary shadow-[inset_0_4px_8px_rgba(0,0,0,0.7),inset_0_-2px_6px_rgba(0,0,0,0.4),0_-2px_4px_rgba(255,255,255,0.1)] z-30" />
      
      {/* Layer 4: Inner Blue Circle with Glossy Effect (z-40) */}
      <div className={`absolute inset-[24px] rounded-full ${colors.innerCircle} ${colors.innerShadow} overflow-hidden z-40`}>
        {/* Primary glossy highlight - brighter and larger */}
        <div className="absolute top-[8%] left-[8%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_25%,rgba(255,255,255,0.2)_45%,transparent_65%)] pointer-events-none" />
        {/* Secondary smaller highlight for realism */}
        <div className="absolute top-[15%] left-[60%] w-[20%] h-[20%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,transparent_60%)] pointer-events-none" />
        {/* Bottom subtle reflection */}
        <div className="absolute bottom-[10%] left-[20%] right-[20%] h-[15%] rounded-full bg-gradient-to-t from-white/10 to-transparent blur-sm pointer-events-none" />
        
        {/* Timer Display - Absolutely centered */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center text-white z-20 ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="text-5xl sm:text-6xl font-bold text-timer"
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
            className="text-base font-medium text-white/90 mt-2"
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
    </div>
  );
};

export default CircularProgressTimer;
