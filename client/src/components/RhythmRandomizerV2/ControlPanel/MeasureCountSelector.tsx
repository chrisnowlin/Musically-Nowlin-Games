/**
 * Measure Count Selector Component
 * Select number of measures to generate
 */

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type MeasureCount = 1 | 2 | 4 | 8 | 12 | 16;

interface MeasureCountSelectorProps {
  value: MeasureCount;
  onChange: (value: MeasureCount) => void;
}

const MEASURE_OPTIONS: { value: MeasureCount; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 4, label: '4' },
  { value: 8, label: '8' },
  { value: 12, label: '12' },
  { value: 16, label: '16' },
];

export function MeasureCountSelector({ value, onChange }: MeasureCountSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Measures</Label>
      <RadioGroup
        value={String(value)}
        onValueChange={(v) => onChange(Number(v) as MeasureCount)}
        className="flex gap-2"
      >
        {MEASURE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center justify-center w-12 h-10 rounded-lg border-2 cursor-pointer
              transition-colors
              ${value === option.value
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <RadioGroupItem
              value={String(option.value)}
              className="sr-only"
            />
            <span className="font-medium">{option.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
