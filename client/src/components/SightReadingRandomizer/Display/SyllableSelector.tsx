/**
 * Syllable Selector Component
 * Select counting syllable system (Kodály, Takadimi, Gordon, Numbers, None)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CountingSystem } from '@/lib/rhythmRandomizer/types';
import {
  getCountingSystemName,
  getCountingSystemDescription,
} from '@/lib/rhythmRandomizer/countingSyllables';

interface SyllableSelectorProps {
  value: CountingSystem;
  onChange: (system: CountingSystem) => void;
  showLabel?: boolean;
  compact?: boolean;
}

const COUNTING_SYSTEMS: CountingSystem[] = [
  'kodaly',
  'takadimi',
  'gordon',
  'numbers',
  'none',
];

export function SyllableSelector({
  value,
  onChange,
  showLabel = true,
  compact = false,
}: SyllableSelectorProps) {
  if (compact) {
    return (
      <Select value={value} onValueChange={(v) => onChange(v as CountingSystem)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Syllables" />
        </SelectTrigger>
        <SelectContent>
          {COUNTING_SYSTEMS.map((system) => (
            <SelectItem key={system} value={system} className="text-xs">
              {getCountingSystemName(system)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && <Label>Counting Syllables</Label>}
      <Select value={value} onValueChange={(v) => onChange(v as CountingSystem)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select syllable system" />
        </SelectTrigger>
        <SelectContent>
          {COUNTING_SYSTEMS.map((system) => (
            <SelectItem key={system} value={system}>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{getCountingSystemName(system)}</span>
                <span className="text-xs text-gray-500">
                  {getCountingSystemDescription(system)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
