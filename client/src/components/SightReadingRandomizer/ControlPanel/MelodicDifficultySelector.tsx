/**
 * Melodic Difficulty Selector Component
 * Toggle buttons for Easy/Medium/Hard difficulty levels
 */

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type MelodicDifficulty = 'easy' | 'medium' | 'hard';

interface MelodicDifficultySelectorProps {
  value: MelodicDifficulty;
  onChange: (value: MelodicDifficulty) => void;
}

interface DifficultyOption {
  value: MelodicDifficulty;
  label: string;
  description: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Stepwise motion (2nds, occasional 3rds)',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Mix of steps and small leaps (up to 5ths)',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Wide range with larger leaps',
  },
];

export function MelodicDifficultySelector({ value, onChange }: MelodicDifficultySelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Melodic Difficulty</Label>
      <div className="grid grid-cols-1 gap-2">
        {DIFFICULTY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'bg-purple-50 border-purple-500 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="font-semibold text-sm mb-1">{option.label}</span>
              <span className="text-xs text-gray-600">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
