
import { useEffect, useState } from 'react';

interface BreathingGuideProps {
  enabled: boolean;
  running: boolean;
}

const BreathingGuide = ({ enabled, running }: BreathingGuideProps) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    if (!enabled || !running) return;
    const interval = setInterval(() => {
      setPhase(p => (p === 'inhale' ? 'exhale' : 'inhale'));
    }, 4000); // 4s inhale/exhale rhythm
    return () => clearInterval(interval);
  }, [enabled, running]);

  if (!enabled || !running) return null;

  return (
    <div className="w-full flex items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background px-4 py-2">
        <div
          className={`h-3 w-3 rounded-full bg-primary transition-transform duration-500 ${
            phase === 'inhale' ? 'scale-125' : 'scale-90'
          }`}
        />
        <span className="text-sm text-muted-foreground capitalize">
          {phase}
        </span>
      </div>
    </div>
  );
};

export default BreathingGuide;
