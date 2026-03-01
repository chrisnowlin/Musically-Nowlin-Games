import { useEffect, useState, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  color: string;
  emoji: string;
}

const PARTICLE_EMOJIS = ['1', '2', '3', '4', '5'];
const PARTICLE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

const MAX_PARTICLES = 12;
const ANIMATION_DURATION = 1500;

interface ConfettiOverlayProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiOverlay({ trigger, onComplete }: ConfettiOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < MAX_PARTICLES; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 40 + Math.random() * 20, // Center area with some spread
        y: 60 + Math.random() * 10, // Start from middle-lower area
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 200,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        emoji: PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)],
      });
    }

    return newParticles;
  }, []);

  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);
      setParticles(createParticles());

      const timeout = setTimeout(() => {
        setParticles([]);
        setIsAnimating(false);
        onComplete?.();
      }, ANIMATION_DURATION);

      return () => clearTimeout(timeout);
    }
  }, [trigger, isAnimating, createParticles, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-burst"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}ms`,
            '--particle-x': `${(Math.random() - 0.5) * 200}px`,
            '--particle-y': `${-150 - Math.random() * 100}px`,
          } as React.CSSProperties}
        >
          <div
            className="text-2xl md:text-3xl transform"
            style={{
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={particle.color}
              className="drop-shadow-md"
            >
              {/* Musical note shape */}
              <ellipse cx="8" cy="18" rx="4" ry="3" />
              <rect x="11" y="4" width="2" height="14" />
              <path d="M13 4 C 17 4, 20 7, 20 10 C 20 13, 17 14, 13 12" fill={particle.color} />
            </svg>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes confetti-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--particle-x), var(--particle-y)) rotate(360deg);
          }
        }
        .animate-confetti-burst {
          animation: confetti-burst ${ANIMATION_DURATION}ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default ConfettiOverlay;
