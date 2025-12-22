/**
 * Sound Selector Component
 * Choose instrument/sound for rhythm playback
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SoundOption } from '@/lib/rhythmRandomizer/types';

interface SoundSelectorProps {
  value: SoundOption;
  onChange: (value: SoundOption) => void;
}

interface SoundOptionConfig {
  value: SoundOption;
  label: string;
  icon: string;
  description: string;
}

const SOUND_OPTIONS: SoundOptionConfig[] = [
  {
    value: 'woodblock',
    label: 'Woodblock',
    icon: '🪵',
    description: 'Classic practice sound',
  },
  {
    value: 'drums',
    label: 'Drums',
    icon: '🥁',
    description: 'Snare drum sound',
  },
  {
    value: 'claps',
    label: 'Claps',
    icon: '👏',
    description: 'Hand clap sound',
  },
  {
    value: 'piano',
    label: 'Piano',
    icon: '🎹',
    description: 'Single piano note',
  },
  {
    value: 'metronome',
    label: 'Metronome',
    icon: '⏱️',
    description: 'Click sound',
  },
];

export function SoundSelector({ value, onChange }: SoundSelectorProps) {
  const selectedOption = SOUND_OPTIONS.find((opt) => opt.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="sound-selector">Sound</Label>
      <Select value={value} onValueChange={(v) => onChange(v as SoundOption)}>
        <SelectTrigger id="sound-selector" className="w-full">
          <SelectValue>
            {selectedOption && (
              <span className="flex items-center gap-2">
                <span>{selectedOption.icon}</span>
                <span>{selectedOption.label}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SOUND_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{option.icon}</span>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
