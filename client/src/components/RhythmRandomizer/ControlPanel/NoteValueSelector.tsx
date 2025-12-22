/**
 * Note Value Selector Component
 * Checkbox grid for selecting allowed note values
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { NoteValue } from '@/lib/rhythmRandomizer/types';

interface NoteValueSelectorProps {
  selectedValues: NoteValue[];
  onChange: (values: NoteValue[]) => void;
}

interface NoteOption {
  value: NoteValue;
  label: string;
  symbol: string;
  beats: string;
}

const NOTE_OPTIONS: NoteOption[] = [
  { value: 'whole', label: 'Whole', symbol: '𝅝', beats: '4 beats' },
  { value: 'half', label: 'Half', symbol: '𝅗𝅥', beats: '2 beats' },
  { value: 'quarter', label: 'Quarter', symbol: '♩', beats: '1 beat' },
  { value: 'eighth', label: 'Eighth', symbol: '♪', beats: '½ beat' },
  { value: 'sixteenth', label: 'Sixteenth', symbol: '𝅘𝅥𝅯', beats: '¼ beat' },
  { value: 'dottedHalf', label: 'Dotted Half', symbol: '𝅗𝅥.', beats: '3 beats' },
  { value: 'dottedQuarter', label: 'Dotted Quarter', symbol: '♩.', beats: '1½ beats' },
  { value: 'dottedEighth', label: 'Dotted Eighth', symbol: '♪.', beats: '¾ beat' },
];

export function NoteValueSelector({ selectedValues, onChange }: NoteValueSelectorProps) {
  const handleToggle = (noteValue: NoteValue) => {
    if (selectedValues.includes(noteValue)) {
      // Don't allow deselecting the last note value
      if (selectedValues.length > 1) {
        onChange(selectedValues.filter((v) => v !== noteValue));
      }
    } else {
      onChange([...selectedValues, noteValue]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {NOTE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
              ${selectedValues.includes(option.value)
                ? 'bg-purple-50 border-purple-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <Checkbox
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-lg">{option.symbol}</span>
                <span className="text-sm font-medium truncate">{option.label}</span>
              </div>
              <span className="text-xs text-gray-500">{option.beats}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
