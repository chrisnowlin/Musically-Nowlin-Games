/**
 * Time Signature Selector Component
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TIME_SIGNATURES } from '@/lib/rhythmRandomizerV3/types';

interface TimeSignatureSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TIME_SIGNATURE_OPTIONS = [
  { value: '2/4', label: '2/4', description: 'March' },
  { value: '3/4', label: '3/4', description: 'Waltz' },
  { value: '4/4', label: '4/4', description: 'Common Time' },
  { value: '5/4', label: '5/4', description: 'Irregular' },
  { value: '6/8', label: '6/8', description: 'Compound Duple' },
  { value: '7/8', label: '7/8', description: 'Irregular' },
  { value: '9/8', label: '9/8', description: 'Compound Triple' },
  { value: '12/8', label: '12/8', description: 'Compound Quadruple' },
];

export function TimeSignatureSelector({ value, onChange }: TimeSignatureSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="time-signature">Time Signature</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="time-signature" className="w-full">
          <SelectValue placeholder="Select time signature" />
        </SelectTrigger>
        <SelectContent>
          {TIME_SIGNATURE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="font-bold text-lg" style={{ fontFamily: '"Noto Music", serif' }}>{option.label}</span>
              <span className="text-gray-500 ml-2 text-sm">({option.description})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
