/**
 * Ensemble Display Component - Enhanced Version
 * Displays multiple rhythm parts for ensemble mode with improved visualizations
 */

import { useMemo } from 'react';
import { EnsemblePattern, CountingSystem, StaffLineMode, StemDirection, SoundOption } from '@/lib/rhythmRandomizerV2/types';
import { addSyllablesToPattern } from '@/lib/rhythmRandomizerV2/countingSyllables';
import { StaffNotation } from './StaffNotation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Volume2, VolumeX, Star, RefreshCw, ArrowRight, Layers, Users } from 'lucide-react';

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
  onChangePartSound?: (partIndex: number, sound: SoundOption) => void;
}

// Sound options for per-part selection
const SOUND_OPTIONS: { value: SoundOption; label: string; icon: string }[] = [
  { value: 'snare', label: 'Snare', icon: '🥁' },
  { value: 'drums', label: 'Drums', icon: '🔊' },
  { value: 'woodblock', label: 'Wood', icon: '🪵' },
  { value: 'claps', label: 'Claps', icon: '👏' },
  { value: 'piano', label: 'Piano', icon: '🎹' },
  { value: 'metronome', label: 'Click', icon: '⏱️' },
];

// Enhanced colors for different parts with gradients
const PART_COLORS = [
  {
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100/50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    accent: 'bg-blue-500',
    ring: 'ring-blue-400',
    glow: 'shadow-blue-200',
  },
  {
    bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
    accent: 'bg-emerald-500',
    ring: 'ring-emerald-400',
    glow: 'shadow-emerald-200',
  },
  {
    bg: 'bg-gradient-to-r from-amber-50 to-amber-100/50',
    border: 'border-amber-300',
    text: 'text-amber-700',
    accent: 'bg-amber-500',
    ring: 'ring-amber-400',
    glow: 'shadow-amber-200',
  },
  {
    bg: 'bg-gradient-to-r from-purple-50 to-purple-100/50',
    border: 'border-purple-300',
    text: 'text-purple-700',
    accent: 'bg-purple-500',
    ring: 'ring-purple-400',
    glow: 'shadow-purple-200',
  },
];

// Body percussion icons with better styling
const BODY_PERCUSSION_CONFIG: Record<string, { icon: string; label: string; position: string }> = {
  snap: { icon: '🫰', label: 'Snap', position: 'High' },
  clap: { icon: '👏', label: 'Clap', position: 'Mid-High' },
  pat: { icon: '🖐️', label: 'Pat', position: 'Mid-Low' },
  stomp: { icon: '👟', label: 'Stomp', position: 'Low' },
};

// Mode icons and labels
const MODE_CONFIG = {
  callResponse: { icon: ArrowRight, label: 'Call & Response', description: 'Parts play in sequence' },
  layered: { icon: Layers, label: 'Layered', description: 'Parts play together' },
  bodyPercussion: { icon: Users, label: 'Body Percussion', description: 'Use your body as the instrument' },
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
  onChangePartSound,
}: EnsembleDisplayProps) {
  // Check if any part is soloed
  const hasSoloedPart = ensemble.parts.some((p) => p.isSoloed);

  // For layered/body percussion modes, all unmuted parts play simultaneously
  const isSimultaneousMode = ensemble.mode === 'layered' || ensemble.mode === 'bodyPercussion';

  // Calculate total beats for progress bar
  const totalBeats = useMemo(() => {
    if (ensemble.mode === 'callResponse') {
      // Sum of all parts for sequential playback
      return ensemble.parts.reduce((sum, p) => sum + p.pattern.totalDurationBeats, 0);
    } else {
      // Max duration for simultaneous playback
      return Math.max(...ensemble.parts.map(p => p.pattern.totalDurationBeats));
    }
  }, [ensemble]);

  // Calculate current progress (rough estimate based on event index)
  const progress = useMemo(() => {
    if (!isPlaying || currentEventIndex < 0) return 0;

    // For simplicity, estimate based on current event vs total events
    const totalEvents = ensemble.parts.reduce((sum, p) =>
      sum + p.pattern.measures.reduce((mSum, m) => mSum + m.events.length, 0), 0
    );

    return Math.min((currentEventIndex / Math.max(totalEvents, 1)) * 100, 100);
  }, [isPlaying, currentEventIndex, ensemble.parts]);

  const modeConfig = MODE_CONFIG[ensemble.mode] || MODE_CONFIG.layered;
  const ModeIcon = modeConfig.icon;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full flex flex-col">
        {/* Mode Header with Progress */}
        <div className="shrink-0 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100">
                <ModeIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{modeConfig.label}</h3>
                <p className="text-xs text-gray-500">{modeConfig.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium">{ensemble.parts.length} parts</span>
              <span>•</span>
              <span>{totalBeats} beats total</span>
            </div>
          </div>

          {/* Progress Bar */}
          {isPlaying && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Parts Container - 2x2 Grid Layout */}
        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {ensemble.parts.map((part, index) => {
            const colors = PART_COLORS[index % PART_COLORS.length];
            const bodyConfig = part.bodyPart ? BODY_PERCUSSION_CONFIG[part.bodyPart] : null;

            // Check if this part is effectively muted
            const isEffectivelyMuted = part.isMuted || (hasSoloedPart && !part.isSoloed);

            // Determine if this part is currently playing
            const isCurrentPart = isSimultaneousMode
              ? !isEffectivelyMuted && currentPartIndex >= 0
              : currentPartIndex === index;

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
                  relative
                  rounded-xl border-2 transition-all duration-200
                  ${colors.bg} ${colors.border}
                  ${isActive ? `ring-2 ${colors.ring} ring-offset-2 shadow-lg ${colors.glow}` : ''}
                  ${isMuted ? 'opacity-40 grayscale' : ''}
                  ${!isActive && !isMuted ? 'hover:shadow-md' : ''}
                `}
              >
                {/* Part header - Compact */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    {/* Part indicator with pulse when active */}
                    <div className={`
                      relative w-3 h-3 rounded-full ${colors.accent}
                      ${isActive ? 'animate-pulse' : ''}
                    `}>
                      {isActive && (
                        <div className={`absolute inset-0 rounded-full ${colors.accent} animate-ping opacity-75`} />
                      )}
                    </div>

                    {/* Body percussion icon (larger) */}
                    {bodyConfig && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-2xl cursor-help" role="img" aria-label={bodyConfig.label}>
                            {bodyConfig.icon}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{bodyConfig.label}</p>
                          <p className="text-xs text-gray-400">{bodyConfig.position} register</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Part label */}
                    <span className={`font-semibold text-sm ${colors.text}`}>
                      {part.label}
                    </span>

                    {/* Playing badge */}
                    {isActive && (
                      <span className={`
                        text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                        ${colors.accent} text-white
                      `}>
                        Playing
                      </span>
                    )}
                  </div>

                  {/* Part controls - More compact */}
                  <div className="flex items-center gap-0.5">
                    {/* Sound selector for layered mode */}
                    {ensemble.mode === 'layered' && (
                      <Select
                        value={part.sound || 'snare'}
                        onValueChange={(value) => onChangePartSound?.(index, value as SoundOption)}
                      >
                        <SelectTrigger className="h-7 w-16 text-xs px-1.5 border-0 bg-white/50">
                          <SelectValue>
                            {SOUND_OPTIONS.find(opt => opt.value === (part.sound || 'snare'))?.icon || '🎵'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {SOUND_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex items-center gap-1.5">
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Mute button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${part.isMuted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
                          onClick={() => onToggleMute?.(index)}
                        >
                          {part.isMuted ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{part.isMuted ? 'Unmute' : 'Mute'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Solo button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${part.isSoloed ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-gray-600'}`}
                          onClick={() => onToggleSolo?.(index)}
                        >
                          <Star className={`w-3.5 h-3.5 ${part.isSoloed ? 'fill-yellow-500' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{part.isSoloed ? 'Unsolo' : 'Solo this part'}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Regenerate button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                          onClick={() => onRegeneratePart?.(index)}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Regenerate this part</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Part notation */}
                <div className="px-3 pb-3">
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

                {/* Part number badge for Call & Response (shows order) */}
                {ensemble.mode === 'callResponse' && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      text-xs font-bold text-white shadow-md
                      ${colors.accent}
                    `}>
                      {index + 1}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Body Percussion Legend */}
        {ensemble.mode === 'bodyPercussion' && (
          <div className="shrink-0 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6">
              {Object.entries(BODY_PERCUSSION_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{config.label}</span>
                    <span className="text-[10px] text-gray-400">{config.position}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call & Response Instructions */}
        {ensemble.mode === 'callResponse' && !isPlaying && (
          <div className="shrink-0 mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              <span className="font-medium">Tip:</span> Perform parts in numbered order (1 → 2 → 3...), or use Solo to practice individually
            </p>
          </div>
        )}

        {/* Layered Mode Tip */}
        {ensemble.mode === 'layered' && !isPlaying && (
          <div className="shrink-0 mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              <span className="font-medium">Tip:</span> All parts play together. Use Mute/Solo to focus on specific parts
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
