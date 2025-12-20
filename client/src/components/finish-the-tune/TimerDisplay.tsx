import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  timeRemaining: number;
  className?: string;
}

export function TimerDisplay({ timeRemaining, className = '' }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  const formatTime = () => {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg
        transition-all duration-300
        ${isCritical
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
          : isLowTime
            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
        }
        ${className}
      `}
      role="timer"
      aria-label={`Time remaining: ${formatTime()}`}
    >
      <Clock className={`w-5 h-5 ${isCritical ? 'animate-spin' : ''}`} />
      <span className="tabular-nums">{formatTime()}</span>
    </div>
  );
}

export default TimerDisplay;
