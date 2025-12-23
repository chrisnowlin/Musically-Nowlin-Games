/**
 * Key Signature Selector Component
 * Grouped dropdown for selecting key signatures with sharps/flats
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
import { Label } from '@/components/ui/label';

interface KeySignatureSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

interface KeyOption {
  value: string;
  label: string;
  accidentals: string;
}

const SHARP_KEYS: KeyOption[] = [
  { value: 'C', label: 'C Major / A minor', accidentals: '' },
  { value: 'G', label: 'G Major / E minor', accidentals: '1#' },
  { value: 'D', label: 'D Major / B minor', accidentals: '2#' },
  { value: 'A', label: 'A Major / F# minor', accidentals: '3#' },
  { value: 'E', label: 'E Major / C# minor', accidentals: '4#' },
  { value: 'B', label: 'B Major / G# minor', accidentals: '5#' },
  { value: 'F#', label: 'F# Major / D# minor', accidentals: '6#' },
];

const FLAT_KEYS: KeyOption[] = [
  { value: 'F', label: 'F Major / D minor', accidentals: '1♭' },
  { value: 'Bb', label: 'B♭ Major / G minor', accidentals: '2♭' },
  { value: 'Eb', label: 'E♭ Major / C minor', accidentals: '3♭' },
  { value: 'Ab', label: 'A♭ Major / F minor', accidentals: '4♭' },
  { value: 'Db', label: 'D♭ Major / B♭ minor', accidentals: '5♭' },
  { value: 'Gb', label: 'G♭ Major / E♭ minor', accidentals: '6♭' },
];

export function KeySignatureSelector({ value, onChange }: KeySignatureSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="key-signature">Key Signature</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="key-signature" className="w-full">
          <SelectValue placeholder="Select key signature" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Natural / Sharp Keys</SelectLabel>
            {SHARP_KEYS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="font-medium">{option.label}</span>
                {option.accidentals && (
                  <span className="text-gray-500 ml-2 text-sm">({option.accidentals})</span>
                )}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Flat Keys</SelectLabel>
            {FLAT_KEYS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="font-medium">{option.label}</span>
                <span className="text-gray-500 ml-2 text-sm">({option.accidentals})</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
