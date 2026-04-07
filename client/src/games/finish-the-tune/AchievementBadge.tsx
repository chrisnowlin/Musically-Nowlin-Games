import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getAchievement } from './finish-the-tune-Achievements';

interface AchievementBadgeProps {
  achievementId: string;
  isNew?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({
  achievementId,
  isNew = false,
  size = 'md',
}: AchievementBadgeProps) {
  const achievement = getAchievement(achievementId);

  if (!achievement) return null;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  return (
    <div
      className={`
        relative flex items-center justify-center rounded-full
        bg-gradient-to-br from-yellow-400 to-amber-500
        shadow-md
        ${sizeClasses[size]}
        ${isNew ? 'animate-bounce ring-2 ring-yellow-300 ring-offset-2' : ''}
      `}
      title={`${achievement.name}: ${achievement.description}`}
    >
      <span className="font-bold text-white drop-shadow-sm">{achievement.icon}</span>
      {isNew && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}
    </div>
  );
}

interface AchievementToastProps {
  achievementId: string;
  onClose: () => void;
}

export function AchievementToast({ achievementId, onClose }: AchievementToastProps) {
  const achievement = getAchievement(achievementId);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-[100]
        flex items-center gap-4 p-4
        bg-gradient-to-r from-yellow-400 to-amber-500
        text-white rounded-2xl shadow-2xl
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
        <Trophy className="w-6 h-6" />
      </div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wider opacity-80">
          Achievement Unlocked!
        </div>
        <div className="font-bold text-lg">{achievement.name}</div>
        <div className="text-sm opacity-90">{achievement.description}</div>
      </div>
    </div>
  );
}

export default AchievementBadge;
