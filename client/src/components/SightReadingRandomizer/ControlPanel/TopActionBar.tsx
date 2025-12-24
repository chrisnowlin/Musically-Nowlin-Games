/**
 * Top Action Bar Component
 * Quick controls bar with presets, regenerate, key signature, and difficulty
 */

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefreshCw, Settings2, Sparkles } from 'lucide-react';
import { DifficultyPreset } from '@/lib/rhythmRandomizer/types';
import { KeySignatureSelector } from './KeySignatureSelector';
import { SIGHT_READING_PRESETS } from './presets';

const PRESET_TOOLTIPS: Record<DifficultyPreset, string> = {
  beginner: 'Simple rhythms with stepwise melodic motion',
  intermediate: 'More complex rhythms with small melodic leaps',
  advanced: 'Challenging rhythms with larger melodic intervals',
  custom: 'Use your current custom settings',
};

interface TopActionBarProps {
  onPresetSelect: (preset: DifficultyPreset) => void;
  onRegenerate: () => void;
  onToggleAdvanced: () => void;
  keySignature: string;
  onKeySignatureChange: (value: string) => void;
}

export function TopActionBar({
  onPresetSelect,
  onRegenerate,
  onToggleAdvanced,
  keySignature,
  onKeySignatureChange,
}: TopActionBarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-white border-b border-gray-200 px-4 py-2 space-y-2">
        {/* Preset Buttons */}
        <div className="flex items-center justify-center gap-2">
          {(['beginner', 'intermediate', 'advanced'] as DifficultyPreset[]).map((preset) => (
            <Tooltip key={preset}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPresetSelect(preset)}
                  className="flex-1 max-w-[100px] capitalize gap-1 text-xs h-8"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {SIGHT_READING_PRESETS[preset].name}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{PRESET_TOOLTIPS[preset]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Quick Controls Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Key Signature */}
          <div className="flex items-center gap-2 flex-1">
            <KeySignatureSelector
              value={keySignature}
              onChange={onKeySignatureChange}
            />
          </div>

          {/* Center: Regenerate (Primary) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRegenerate}
                className="gap-1.5 px-5 min-w-[140px] h-9"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate a new random exercise</p>
            </TooltipContent>
          </Tooltip>

          {/* Right: Advanced Settings */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleAdvanced}
                  className="gap-1.5 h-8"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Advanced</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Customize time signature, tempo, note values, and more</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
