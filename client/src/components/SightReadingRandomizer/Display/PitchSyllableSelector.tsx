/**
 * Pitch Syllable Selector Component
 * Select syllable system - pitch-based (Moveable Do, Scale Degrees, Note Names)
 * or rhythm-based (Kodály, Takadimi, Gordon, Numbers)
 */

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import type { PitchSyllableSystem } from '@/lib/sightReadingRandomizer/types';
import {
  getPitchSyllableSystemName,
  getPitchSyllableSystemDescription,
} from '@/lib/sightReadingRandomizer/solfegeSyllables';

interface PitchSyllableSelectorProps {
  value: PitchSyllableSystem;
  onChange: (system: PitchSyllableSystem) => void;
  showLabel?: boolean;
  compact?: boolean;
}

// Pitch-based syllable systems
const PITCH_SYLLABLE_SYSTEMS: PitchSyllableSystem[] = [
  'moveableDo',
  'fixedDo',
  'scaleDegrees',
  'noteNames',
];

// Rhythm-based syllable systems
const RHYTHM_SYLLABLE_SYSTEMS: PitchSyllableSystem[] = [
  'kodaly',
  'takadimi',
  'gordon',
  'numbers',
];

export function PitchSyllableSelector({
  value,
  onChange,
  showLabel = true,
  compact = false,
}: PitchSyllableSelectorProps) {
  if (compact) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select value={value} onValueChange={(v) => onChange(v as PitchSyllableSystem)}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Syllables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-xs text-gray-500">Pitch Syllables</SelectLabel>
                    {PITCH_SYLLABLE_SYSTEMS.map((system) => (
                      <SelectItem key={system} value={system} className="text-xs">
                        {getPitchSyllableSystemName(system)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-xs text-gray-500">Rhythm Syllables</SelectLabel>
                    {RHYTHM_SYLLABLE_SYSTEMS.map((system) => (
                      <SelectItem key={system} value={system} className="text-xs">
                        {getPitchSyllableSystemName(system)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectItem value="none" className="text-xs">
                      None
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Syllable naming system for notes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && <Label>Syllables</Label>}
      <Select value={value} onValueChange={(v) => onChange(v as PitchSyllableSystem)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select syllable system" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Pitch Syllables</SelectLabel>
            {PITCH_SYLLABLE_SYSTEMS.map((system) => (
              <SelectItem key={system} value={system}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{getPitchSyllableSystemName(system)}</span>
                  <span className="text-xs text-gray-500">
                    {getPitchSyllableSystemDescription(system)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Rhythm Syllables</SelectLabel>
            {RHYTHM_SYLLABLE_SYSTEMS.map((system) => (
              <SelectItem key={system} value={system}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{getPitchSyllableSystemName(system)}</span>
                  <span className="text-xs text-gray-500">
                    {getPitchSyllableSystemDescription(system)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectItem value="none">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">None</span>
                <span className="text-xs text-gray-500">
                  {getPitchSyllableSystemDescription('none')}
                </span>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
