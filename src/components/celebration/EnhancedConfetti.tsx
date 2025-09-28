import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface EnhancedConfettiProps {
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high' | 'epic';
  duration?: number;
}

const EnhancedConfetti = ({ 
  isActive, 
  intensity = 'medium', 
  duration = 4000 
}: EnhancedConfettiProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; color: string; size: number; shape: string }>>([]);

  const intensityConfig = {
    low: { count: 20, sizeRange: [2, 4] },
    medium: { count: 40, sizeRange: [2, 6] },
    high: { count: 60, sizeRange: [3, 8] },
    epic: { count: 100, sizeRange: [4, 10] }
  };

  const config = intensityConfig[intensity];

  const colors = [
    '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3',
    '#FF9F43', '#10AC84', '#EE5A24', '#0ABDE3'
  ];

  const shapes = ['circle', 'square', 'triangle', 'star'];

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: config.count }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        size: Math.random() * (config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0],
        shape: shapes[i % shapes.length]
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, intensity, duration]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: particle.shape === 'circle' ? '50%' : 
                          particle.shape === 'square' ? '0%' : '50%',
            left: '50%',
            top: '50%',
            clipPath: particle.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                     particle.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                     'none'
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
            scale: [0, 1.2, 0.8, 0],
            rotate: [0, 180, 360, 540],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4,
            delay: particle.id * 0.02,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
};

export default EnhancedConfetti;
