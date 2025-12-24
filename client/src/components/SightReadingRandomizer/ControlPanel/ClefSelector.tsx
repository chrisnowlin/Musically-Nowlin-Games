/**
 * Clef Selector Component
 * Toggle between treble and bass clef
 */

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClefType } from '@/lib/rhythmRandomizer/types';

interface ClefSelectorProps {
  value: ClefType;
  onChange: (value: ClefType) => void;
}

const CLEF_OPTIONS: { value: ClefType; label: string; symbol: string; tooltip: string }[] = [
  { value: 'treble', label: 'Treble', symbol: '𝄞', tooltip: 'Treble clef (G clef) - higher range' },
  { value: 'bass', label: 'Bass', symbol: '𝄢', tooltip: 'Bass clef (F clef) - lower range' },
];

export function ClefSelector({ value, onChange }: ClefSelectorProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        {CLEF_OPTIONS.map((option) => (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>
              <Button
                variant={value === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(option.value)}
                className="h-7 text-xs gap-1.5 px-2"
              >
                <span className="text-base leading-none" style={{ fontFamily: '"Noto Music", serif' }}>
                  {option.symbol}
                </span>
                {option.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{option.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
