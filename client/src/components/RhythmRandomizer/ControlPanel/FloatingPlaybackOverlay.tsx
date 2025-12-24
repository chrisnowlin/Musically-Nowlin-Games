/**
 * Floating Playback Overlay Component
 * Compact floating playback controls with expandable advanced options
 * Adapted for Rhythm Randomizer V3 (no pitch/key signature controls)
 */

import { useState } from 'react';
import { Play, Square, Pause, Volume2, VolumeX, Repeat, Timer, ChevronUp, ChevronDown, RefreshCw, Settings2, Sparkles, Music, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CountingSystem, DifficultyPreset, StaffLineMode, StemDirection } from '@/lib/rhythmRandomizer/types';
import { RHYTHM_PRESETS, PRESET_TOOLTIPS } from './presets';

type MeasureCountOption = 1 | 2 | 4 | 8 | 12 | 16;

const TIME_SIGNATURE_OPTIONS = [
  '2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8'
] as const;

const COUNTING_SYSTEM_LABELS: Record<CountingSystem, string> = {
  none: 'No syllables',
  kodaly: 'Kodály (ta, ti-ti)',
  takadimi: 'Takadimi',
  gordon: 'Gordon',
  numbers: 'Numbers (1 e & a)',
};

interface FloatingPlaybackOverlayProps {
  playbackState: {
    isPlaying: boolean;
    isPaused: boolean;
    isMetronomePlaying: boolean;
  };
  isReady: boolean;
  hasPattern: boolean;
  loopEnabled: boolean;
  countInMeasures: 0 | 1 | 2;
  metronomeEnabled: boolean;
  volume: number;
  tempo: number;
  measureCount: number;
  startMeasure: number;
  selectedMeasureCount: MeasureCountOption;
  timeSignature: string;
  countingSystem: CountingSystem;
  staffLineMode: StaffLineMode;
  stemDirection: StemDirection;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onLoopChange: (enabled: boolean) => void;
  onCountInChange: (measures: 0 | 1 | 2) => void;
  onMetronomeChange: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onStartMeasureChange: (measure: number) => void;
  onPlayMetronome: () => void;
  onStopMetronome: () => void;
  onMeasureCountChange: (count: MeasureCountOption) => void;
  onTimeSignatureChange: (value: string) => void;
  onCountingSystemChange: (system: CountingSystem) => void;
  onStaffLineModeChange: (mode: StaffLineMode) => void;
  onStemDirectionChange: (direction: StemDirection) => void;
  onRegenerate: () => void;
  onPresetSelect: (preset: DifficultyPreset) => void;
  onToggleAdvanced: () => void;
}

const MEASURE_OPTIONS: MeasureCountOption[] = [1, 2, 4, 8, 12, 16];

export function FloatingPlaybackOverlay({
  playbackState,
  isReady,
  hasPattern,
  loopEnabled,
  countInMeasures,
  metronomeEnabled,
  volume,
  tempo,
  measureCount,
  startMeasure,
  selectedMeasureCount,
  timeSignature,
  countingSystem,
  staffLineMode,
  stemDirection,
  onPlay,
  onStop,
  onPause,
  onResume,
  onLoopChange,
  onCountInChange,
  onMetronomeChange,
  onVolumeChange,
  onStartMeasureChange,
  onPlayMetronome,
  onStopMetronome,
  onMeasureCountChange,
  onTimeSignatureChange,
  onCountingSystemChange,
  onStaffLineModeChange,
  onStemDirectionChange,
  onRegenerate,
  onPresetSelect,
  onToggleAdvanced,
}: FloatingPlaybackOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isPlaying, isPaused, isMetronomePlaying } = playbackState;
  const canPlay = hasPattern && isReady;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col print:hidden">
        {/* Expanded Section (Above main controls - slides up) */}
        {isExpanded && (
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 space-y-3">
          {/* Presets Row */}
          <div className="flex items-center justify-center gap-2">
            {(['beginner', 'intermediate', 'advanced'] as DifficultyPreset[]).map((preset) => (
              <Tooltip key={preset}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPresetSelect(preset)}
                    className="flex-1 max-w-[120px] capitalize gap-1.5 text-xs h-9"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {RHYTHM_PRESETS[preset].name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{PRESET_TOOLTIPS[preset]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Tempo & Metronome */}
          <div className="grid grid-cols-2 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={isMetronomePlaying ? onStopMetronome : onPlayMetronome}
                  variant={isMetronomePlaying ? 'destructive' : 'outline'}
                  size="sm"
                  disabled={!isReady}
                  className="gap-1.5 h-9"
                >
                  <Timer className={`w-4 h-4 ${isMetronomePlaying ? 'animate-pulse' : ''}`} />
                  {isMetronomePlaying ? 'Stop' : `${tempo} BPM`}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMetronomePlaying ? 'Stop metronome' : 'Preview tempo with metronome'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={String(countInMeasures)}
                    onValueChange={(value) => onCountInChange(Number(value) as 0 | 1 | 2)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No count-in</SelectItem>
                      <SelectItem value="1">1 measure count-in</SelectItem>
                      <SelectItem value="2">2 measure count-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Metronome clicks before playback starts</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Start Measure & Counting System */}
          <div className="grid grid-cols-2 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={String(startMeasure)}
                    onValueChange={(value) => onStartMeasureChange(Number(value))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: measureCount }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1 === 1 ? 'Start from beginning' : `Start from measure ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose where to start playback</p>
              </TooltipContent>
            </Tooltip>

            {/* Counting System */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={countingSystem}
                    onValueChange={(value) => onCountingSystemChange(value as CountingSystem)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COUNTING_SYSTEM_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose counting syllable system</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Display Options */}
          <div className="flex items-center justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={staffLineMode === 'full' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStaffLineModeChange(staffLineMode === 'single' ? 'full' : 'single')}
                  className="gap-1.5 text-xs h-9"
                >
                  <Music className="w-3.5 h-3.5" />
                  {staffLineMode === 'single' ? '1 Line' : '5 Lines'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{staffLineMode === 'single' ? 'Single-line staff' : 'Full 5-line staff'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStemDirectionChange(stemDirection === 'up' ? 'down' : 'up')}
                  className="gap-1.5 text-xs h-9"
                >
                  {stemDirection === 'up' ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                  )}
                  Stems {stemDirection === 'up' ? 'Up' : 'Down'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle stem direction</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Main Controls Bar (Always Visible) */}
      <div className="bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
          {/* Left Section: Expand + Time Signature + Regenerate */}
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-9 w-9 shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? 'Hide options' : 'More options'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select value={timeSignature} onValueChange={onTimeSignatureChange}>
                    <SelectTrigger className="h-9 w-[80px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SIGNATURE_OPTIONS.map((ts) => (
                        <SelectItem key={ts} value={ts}>
                          {ts}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Time signature</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onRegenerate}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 h-9 px-3"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate new rhythm</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Center Section: Playback Controls */}
          <div className="flex items-center gap-2">
            {!isPlaying && !isPaused && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onPlay}
                    disabled={!canPlay}
                    className="gap-2 h-10 px-6 text-base"
                  >
                    <Play className="w-5 h-5" />
                    Play
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Play the rhythm</p>
                </TooltipContent>
              </Tooltip>
            )}

            {isPlaying && (
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onPause}
                      variant="secondary"
                      className="gap-2 h-10 px-4"
                    >
                      <Pause className="w-5 h-5" />
                      Pause
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pause playback</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onStop}
                      variant="destructive"
                      size="icon"
                      className="h-10 w-10"
                    >
                      <Square className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop and reset</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {isPaused && (
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onResume}
                      className="gap-2 h-10 px-4"
                    >
                      <Play className="w-5 h-5" />
                      Resume
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Resume playback</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onStop}
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                    >
                      <Square className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop and reset</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Right Section: Audio Controls + Measures + Settings */}
          <div className="flex items-center gap-3">
            {/* Volume (hidden on small screens) */}
            <div className="hidden md:flex items-center gap-1.5 pr-3 border-r border-gray-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {volume > 0 ? (
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{volume > 0 ? 'Mute' : 'Unmute'}</p>
                </TooltipContent>
              </Tooltip>
              <Slider
                value={[volume * 100]}
                onValueChange={([value]) => onVolumeChange(value / 100)}
                min={0}
                max={100}
                step={5}
                className="w-20"
              />
            </div>

            {/* Loop & Click Track */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onLoopChange(!loopEnabled)}
                    className={`p-2 rounded-md transition-colors ${
                      loopEnabled
                        ? 'bg-purple-100 text-purple-600'
                        : 'hover:bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Loop {loopEnabled ? '(on)' : '(off)'}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onMetronomeChange(!metronomeEnabled)}
                    className={`p-2 rounded-md transition-colors ${
                      metronomeEnabled
                        ? 'bg-purple-100 text-purple-600'
                        : 'hover:bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click track {metronomeEnabled ? '(on)' : '(off)'}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Measure Count */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  {MEASURE_OPTIONS.map((count) => (
                    <button
                      key={count}
                      onClick={() => onMeasureCountChange(count)}
                      className={`
                        w-7 h-7 text-xs font-medium rounded-md transition-all
                        ${selectedMeasureCount === count
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of measures</p>
              </TooltipContent>
            </Tooltip>

            {/* Advanced Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleAdvanced}
                  className="h-9 w-9"
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Advanced settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
