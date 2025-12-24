/**
 * Preset Selector Component
 * Quick difficulty presets for the rhythm randomizer
 */

import { Button } from '@/components/ui/button';
import { DifficultyPreset } from '@/lib/rhythmRandomizerV2/types';

interface PresetSelectorProps {
  onSelectPreset: (preset: DifficultyPreset) => void;
}

const PRESETS: { value: DifficultyPreset; label: string; description: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Quarter & half notes only',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Add eighth notes & syncopation',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'All note values & triplets',
  },
];

export function PresetSelector({ onSelectPreset }: PresetSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.value}
          variant="outline"
          size="sm"
          onClick={() => onSelectPreset(preset.value)}
          className="flex-1 min-w-[100px]"
          title={preset.description}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
