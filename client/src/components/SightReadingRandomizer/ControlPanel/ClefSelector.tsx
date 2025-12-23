/**
 * Clef Selector Component
 * Toggle between treble and bass clef
 */

import { Button } from '@/components/ui/button';
import { ClefType } from '@/lib/rhythmRandomizer/types';

interface ClefSelectorProps {
  value: ClefType;
  onChange: (value: ClefType) => void;
}

const CLEF_OPTIONS: { value: ClefType; label: string; symbol: string }[] = [
  { value: 'treble', label: 'Treble', symbol: '𝄞' },
  { value: 'bass', label: 'Bass', symbol: '𝄢' },
];

export function ClefSelector({ value, onChange }: ClefSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {CLEF_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
          className="h-7 text-xs gap-1.5 px-2"
          title={`${option.label} Clef`}
        >
          <span className="text-base leading-none" style={{ fontFamily: '"Noto Music", serif' }}>
            {option.symbol}
          </span>
          {option.label}
        </Button>
      ))}
    </div>
  );
}
