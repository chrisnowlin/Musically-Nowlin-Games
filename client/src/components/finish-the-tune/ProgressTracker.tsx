import { Progress } from '@/components/ui/progress';
import { Music, CheckCircle2 } from 'lucide-react';
import { TOTAL_MELODIES } from './finish-the-tune-Logic';

interface ProgressTrackerProps {
  completedMelodies: Set<string>;
  className?: string;
}

export function ProgressTracker({ completedMelodies, className = '' }: ProgressTrackerProps) {
  const discovered = completedMelodies.size;
  const progressPercent = (discovered / TOTAL_MELODIES) * 100;
  const isComplete = discovered >= TOTAL_MELODIES;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5">
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Music className="w-5 h-5 text-purple-500" />
        )}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {discovered}/{TOTAL_MELODIES}
        </span>
      </div>

      <div className="flex-1 min-w-[80px] max-w-[120px]">
        <Progress
          value={progressPercent}
          className="h-2"
        />
      </div>

      {isComplete && (
        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
          Complete!
        </span>
      )}
    </div>
  );
}

export default ProgressTracker;
