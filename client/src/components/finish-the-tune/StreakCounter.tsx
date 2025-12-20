import { Flame, Sparkles, Zap } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  bestStreak: number;
}

export function StreakCounter({ streak, bestStreak }: StreakCounterProps) {
  if (streak === 0 && bestStreak === 0) return null;

  const hasFireEffect = streak >= 3;
  const hasSparkleEffect = streak >= 5;
  const isOnFire = streak >= 10;

  return (
    <div className="flex items-center gap-4">
      {/* Current Streak */}
      {streak > 0 && (
        <div
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-bold
            transition-all duration-300
            ${isOnFire
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 animate-pulse'
              : hasSparkleEffect
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                : hasFireEffect
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }
          `}
        >
          {hasSparkleEffect && (
            <Sparkles
              className={`w-5 h-5 ${isOnFire ? 'animate-spin' : 'animate-pulse'}`}
            />
          )}
          {hasFireEffect && !hasSparkleEffect && (
            <Flame className="w-5 h-5 animate-pulse text-orange-500" />
          )}
          {!hasFireEffect && streak > 0 && (
            <Zap className="w-4 h-4" />
          )}
          <span className="text-lg">{streak}</span>
          <span className="text-sm opacity-75">streak</span>
        </div>
      )}

      {/* Best Streak (when current is 0 but best exists) */}
      {streak === 0 && bestStreak > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
          <span>Best: {bestStreak}</span>
        </div>
      )}
    </div>
  );
}

export default StreakCounter;
