
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
        outerRing: 'bg-gradient-to-br from-green-500 to-emerald-500',
        outerShadow: 'shadow-[0_12px_32px_rgba(34,197,94,0.4),0_6px_16px_rgba(34,197,94,0.3),0_2px_8px_rgba(34,197,94,0.2)]',
        innerCircle: 'bg-gradient-to-br from-green-400 to-emerald-400',
        innerShadow: 'shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2),0_2px_8px_rgba(34,197,94,0.2)]'
      };
    }
    if (state === 'paused') {
      return { 
        outerRing: 'bg-gradient-to-br from-gray-400 to-gray-500',
        outerShadow: 'shadow-[0_12px_32px_rgba(156,163,175,0.4),0_6px_16px_rgba(156,163,175,0.3),0_2px_8px_rgba(156,163,175,0.2)]',
        innerCircle: 'bg-gradient-to-br from-gray-300 to-gray-400',
        innerShadow: 'shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2),0_2px_8px_rgba(156,163,175,0.2)]'
      };
    }
    
    // For running state, check time-based warnings
    if (state === 'running') {
      if (timeLeft <= 10) {
        return { 
          outerRing: 'bg-gradient-to-br from-red-500 to-red-600',
          outerShadow: 'shadow-[0_12px_32px_rgba(239,68,68,0.4),0_6px_16px_rgba(239,68,68,0.3),0_2px_8px_rgba(239,68,68,0.2)]',
          innerCircle: 'bg-gradient-to-br from-[#0284b8] via-[#0298d4] to-[#2eb8e8]',
          innerShadow: 'shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2),0_2px_8px_rgba(3,183,238,0.2)]'
        };
      }
      if (timeLeft <= 30) {
        return { 
          outerRing: 'bg-gradient-to-br from-yellow-500 to-amber-500',
          outerShadow: 'shadow-[0_12px_32px_rgba(234,179,8,0.4),0_6px_16px_rgba(234,179,8,0.3),0_2px_8px_rgba(234,179,8,0.2)]',
          innerCircle: 'bg-gradient-to-br from-[#0284b8] via-[#0298d4] to-[#2eb8e8]',
          innerShadow: 'shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2),0_2px_8px_rgba(3,183,238,0.2)]'
        };
      }
    }
    
    // Default: orange outer ring, blue inner circle
    return { 
      outerRing: 'bg-gradient-orange-ring',
      outerShadow: 'shadow-[0_12px_32px_rgba(255,107,53,0.4),0_6px_16px_rgba(255,107,53,0.3),0_2px_8px_rgba(255,107,53,0.2)]',
      innerCircle: 'bg-gradient-to-br from-[#0284b8] via-[#0298d4] to-[#2eb8e8]',
      innerShadow: 'shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2),0_2px_8px_rgba(3,183,238,0.2)]'
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
    <div className="relative w-[200px] h-[200px] sm:w-[320px] sm:h-[320px] flex items-center justify-center mx-auto">
      {/* Layer 1: Outer Orange Ring with Progress */}
      <div className={`absolute inset-0 rounded-full ${colors.outerRing} ${colors.outerShadow} shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)]`}>
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
            initial={{ strokeDashoffset: desktopCircumference }}
            animate={{ strokeDashoffset: desktopCircumference * (remainingProgress / 100) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
      
      {/* Layer 1.5: Dark Rim/Border Between Rings */}
      <div className="absolute inset-[20px] rounded-full bg-gradient-to-br from-[#1a2332] to-[#2d3d54] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_-2px_4px_rgba(255,255,255,0.1)]" />
      
      {/* Layer 2: Inner Blue Circle with Glossy Effect */}
      <div className={`absolute inset-[24px] rounded-full ${colors.innerCircle} ${colors.innerShadow} overflow-hidden`}>
        {/* Enhanced Glossy Highlight */}
        <div className="absolute top-[12%] left-[12%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.3)_30%,rgba(255,255,255,0.1)_50%,transparent_70%)] pointer-events-none" />
        
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
