/**
 * Ensemble Display Component
 * Displays multiple rhythm parts for ensemble mode
 */

import { EnsemblePattern, CountingSystem, StaffLineMode, StemDirection } from '@/lib/rhythmRandomizer/types';
import { addSyllablesToPattern } from '@/lib/rhythmRandomizer/countingSyllables';
import { StaffNotation } from './StaffNotation';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Star, RefreshCw } from 'lucide-react';

interface EnsembleDisplayProps {
  ensemble: EnsemblePattern;
  countingSystem: CountingSystem;
  staffLineMode?: StaffLineMode;
  stemDirection?: StemDirection;
  currentPartIndex?: number;
  currentEventIndex?: number;
  isPlaying?: boolean;
  onToggleMute?: (partIndex: number) => void;
  onToggleSolo?: (partIndex: number) => void;
  onRegeneratePart?: (partIndex: number) => void;
}

// Colors for different parts
const PART_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500' },
  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', accent: 'bg-green-500' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'bg-orange-500' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'bg-purple-500' },
];

// Body percussion icons/emojis
const BODY_PERCUSSION_ICONS: Record<string, string> = {
  stomp: '👟',
  clap: '👏',
  snap: '🫰',
  pat: '🖐️',
};

export function EnsembleDisplay({
  ensemble,
  countingSystem,
  staffLineMode = 'single',
  stemDirection = 'up',
  currentPartIndex = -1,
  currentEventIndex = -1,
  isPlaying = false,
  onToggleMute,
  onToggleSolo,
  onRegeneratePart,
}: EnsembleDisplayProps) {
  // Check if any part is soloed
  const hasSoloedPart = ensemble.parts.some((p) => p.isSoloed);

  // For layered/body percussion modes, all unmuted parts play simultaneously
  const isSimultaneousMode = ensemble.mode === 'layered' || ensemble.mode === 'bodyPercussion';

  return (
    <div className="space-y-4">
      {/* Ensemble mode header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {ensemble.mode === 'callResponse' && 'Call & Response'}
          {ensemble.mode === 'layered' && 'Layered Parts'}
          {ensemble.mode === 'bodyPercussion' && 'Body Percussion'}
        </span>
        <span className="text-gray-500">
          {ensemble.parts.length} parts
        </span>
      </div>

      {/* Parts display */}
      <div className="space-y-3">
        {ensemble.parts.map((part, index) => {
          const colors = PART_COLORS[index % PART_COLORS.length];

          // Check if this part is effectively muted (muted directly or not soloed when others are)
          const isEffectivelyMuted = part.isMuted || (hasSoloedPart && !part.isSoloed);

          // Determine if this part is currently playing
          // For simultaneous modes: all unmuted parts are active when isPlaying
          // For call & response: only the current part index is active
          const isCurrentPart = isSimultaneousMode
            ? !isEffectivelyMuted && currentPartIndex >= 0  // All unmuted parts active when playing
            : currentPartIndex === index;  // Only current part active for sequential

          const isActive = isPlaying && isCurrentPart;
          const isMuted = isEffectivelyMuted;

          // Add syllables to pattern
          const patternWithSyllables = addSyllablesToPattern(
            part.pattern,
            countingSystem
          );

          return (
            <div
              key={part.id}
              className={`
                rounded-lg border-2 transition-all
                ${colors.bg} ${colors.border}
                ${isActive ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                ${isMuted ? 'opacity-50' : ''}
              `}
            >
              {/* Part header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/50">
                <div className="flex items-center gap-2">
                  {/* Part indicator */}
                  <div className={`w-3 h-3 rounded-full ${colors.accent}`} />

                  {/* Body percussion icon */}
                  {part.bodyPart && (
                    <span className="text-lg" role="img" aria-label={part.bodyPart}>
                      {BODY_PERCUSSION_ICONS[part.bodyPart]}
                    </span>
                  )}

                  {/* Part label */}
                  <span className={`font-medium ${colors.text}`}>
                    {part.label}
                  </span>

                  {/* Playing indicator */}
                  {isActive && (
                    <span className="animate-pulse text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                      Playing
                    </span>
                  )}
                </div>

                {/* Part controls */}
                <div className="flex items-center gap-1">
                  {/* Mute button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 ${part.isMuted ? 'text-red-500' : 'text-gray-500'}`}
                    onClick={() => onToggleMute?.(index)}
                    title={part.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {part.isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Solo button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 ${part.isSoloed ? 'text-yellow-500' : 'text-gray-500'}`}
                    onClick={() => onToggleSolo?.(index)}
                    title={part.isSoloed ? 'Unsolo' : 'Solo'}
                  >
                    <Star className={`w-4 h-4 ${part.isSoloed ? 'fill-yellow-500' : ''}`} />
                  </Button>

                  {/* Regenerate part button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-500"
                    onClick={() => onRegeneratePart?.(index)}
                    title="Regenerate this part"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Part notation */}
              <div className="p-3">
                <StaffNotation
                  pattern={patternWithSyllables}
                  currentEventIndex={isCurrentPart ? currentEventIndex : -1}
                  isPlaying={isActive}
                  showSyllables={countingSystem !== 'none'}
                  countingSystem={countingSystem}
                  staffLineMode={staffLineMode}
                  stemDirection={stemDirection}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ensemble legend */}
      {ensemble.mode === 'bodyPercussion' && (
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2 border-t">
          {Object.entries(BODY_PERCUSSION_ICONS).map(([key, icon]) => (
            <div key={key} className="flex items-center gap-1">
              <span>{icon}</span>
              <span className="capitalize">{key}</span>
            </div>
          ))}
        </div>
      )}

      {/* Call & Response instructions */}
      {ensemble.mode === 'callResponse' && (
        <div className="text-xs text-center text-gray-500 pt-2 border-t">
          Perform the Call pattern, then the Response pattern
        </div>
      )}
    </div>
  );
}
