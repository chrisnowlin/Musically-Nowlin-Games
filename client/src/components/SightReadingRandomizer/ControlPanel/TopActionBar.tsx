/**
 * Top Action Bar Component
 * Quick controls bar with presets, regenerate, key signature, clef, and difficulty
 */

import { Button } from '@/components/ui/button';
import { RefreshCw, Settings2, Sparkles } from 'lucide-react';
import { DifficultyPreset } from '@/lib/rhythmRandomizer/types';
import { KeySignatureSelector } from './KeySignatureSelector';
import { ClefSelector } from './ClefSelector';
import { SIGHT_READING_PRESETS } from './presets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TopActionBarProps {
  onPresetSelect: (preset: DifficultyPreset) => void;
  onRegenerate: () => void;
  onToggleAdvanced: () => void;
  keySignature: string;
  onKeySignatureChange: (value: string) => void;
  clef: 'treble' | 'bass';
  onClefChange: (clef: 'treble' | 'bass') => void;
  melodicDifficulty: 'easy' | 'medium' | 'hard';
  onMelodicDifficultyChange: (value: 'easy' | 'medium' | 'hard') => void;
}

export function TopActionBar({
  onPresetSelect,
  onRegenerate,
  onToggleAdvanced,
  keySignature,
  onKeySignatureChange,
  clef,
  onClefChange,
  melodicDifficulty,
  onMelodicDifficultyChange,
}: TopActionBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
      {/* Preset Buttons */}
      <div className="flex items-center justify-center gap-2">
        {(['beginner', 'intermediate', 'advanced'] as DifficultyPreset[]).map((preset) => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            onClick={() => onPresetSelect(preset)}
            className="flex-1 max-w-[120px] capitalize gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {SIGHT_READING_PRESETS[preset].name}
          </Button>
        ))}
      </div>

      {/* Quick Controls Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Key & Clef */}
        <div className="flex items-center gap-2 flex-1">
          <KeySignatureSelector
            value={keySignature}
            onChange={onKeySignatureChange}
          />
          <ClefSelector
            value={clef}
            onChange={onClefChange}
          />
        </div>

        {/* Center: Regenerate (Primary) */}
        <Button
          onClick={onRegenerate}
          size="lg"
          className="gap-2 px-6 min-w-[160px]"
        >
          <RefreshCw className="w-5 h-5" />
          Regenerate
        </Button>

        {/* Right: Difficulty & Advanced */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Select
            value={melodicDifficulty}
            onValueChange={onMelodicDifficultyChange}
          >
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAdvanced}
            className="gap-1.5"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
