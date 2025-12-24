/**
 * Ensemble Mode Selector Component
 * Select ensemble mode and number of parts
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EnsembleMode } from '@/lib/rhythmRandomizerV3/types';
import { getEnsembleModeDisplayName } from '@/lib/rhythmRandomizerV3/ensembleGenerator';
import { Users, MessageSquare, Layers, HandMetal } from 'lucide-react';

interface EnsembleModeSelectorProps {
  mode: EnsembleMode;
  partCount: 2 | 3 | 4;
  onModeChange: (mode: EnsembleMode) => void;
  onPartCountChange: (count: 2 | 3 | 4) => void;
}

const ENSEMBLE_MODES: { value: EnsembleMode; description: string; icon: React.ReactNode }[] = [
  {
    value: 'single',
    description: 'Standard single-part rhythm',
    icon: <Users className="w-4 h-4" />,
  },
  {
    value: 'callResponse',
    description: 'Question and answer patterns',
    icon: <MessageSquare className="w-4 h-4" />,
  },
  {
    value: 'layered',
    description: 'Multiple complementary parts',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    value: 'bodyPercussion',
    description: 'Stomp, clap, snap, pat parts',
    icon: <HandMetal className="w-4 h-4" />,
  },
];

const PART_COUNT_OPTIONS: { value: 2 | 3 | 4; label: string }[] = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
];

export function EnsembleModeSelector({
  mode,
  partCount,
  onModeChange,
  onPartCountChange,
}: EnsembleModeSelectorProps) {
  const showPartCount = mode !== 'single' && mode !== 'callResponse';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Ensemble Mode</Label>
        <Select value={mode} onValueChange={(v) => onModeChange(v as EnsembleMode)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            {ENSEMBLE_MODES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <div>
                    <div className="font-medium">
                      {getEnsembleModeDisplayName(option.value)}
                    </div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showPartCount && (
        <div className="space-y-2">
          <Label>Number of Parts</Label>
          <RadioGroup
            value={String(partCount)}
            onValueChange={(v) => onPartCountChange(Number(v) as 2 | 3 | 4)}
            className="flex gap-2"
          >
            {PART_COUNT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center justify-center w-12 h-10 rounded-lg border-2 cursor-pointer
                  transition-colors
                  ${partCount === option.value
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
      )}

      {/* Mode-specific hints */}
      {mode === 'callResponse' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Call & Response generates two patterns: a "call" phrase followed by a complementary "response" phrase.
        </div>
      )}
      {mode === 'layered' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Layered mode generates multiple parts with varying complexity, from foundational to intricate.
        </div>
      )}
      {mode === 'bodyPercussion' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Body percussion assigns different body actions (stomp, clap, snap, pat) to each part.
        </div>
      )}
    </div>
  );
}
