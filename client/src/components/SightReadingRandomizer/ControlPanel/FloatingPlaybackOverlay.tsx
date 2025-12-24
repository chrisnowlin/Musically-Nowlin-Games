/**
 * Floating Playback Overlay Component
 * Compact floating playback controls with expandable advanced options
 */

import { useState } from 'react';
import { Play, Square, Pause, Volume2, VolumeX, Repeat, Timer, ChevronUp, ChevronDown, RefreshCw, Settings2, Sparkles, Metronome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
import { DifficultyPreset } from '@/lib/rhythmRandomizer/types';
import { SIGHT_READING_PRESETS } from './presets';

type MeasureCountOption = 1 | 2 | 4 | 8 | 12 | 16;

const PRESET_TOOLTIPS: Record<DifficultyPreset, string> = {
  beginner: 'Simple rhythms with stepwise melodic motion',
  intermediate: 'More complex rhythms with small melodic leaps',
  advanced: 'Challenging rhythms with larger melodic intervals',
  custom: 'Use your current custom settings',
};

const KEY_SIGNATURES = [
  { value: 'C', label: 'C Major' },
  { value: 'G', label: 'G Major' },
  { value: 'D', label: 'D Major' },
  { value: 'A', label: 'A Major' },
  { value: 'E', label: 'E Major' },
  { value: 'B', label: 'B Major' },
  { value: 'F#', label: 'F# Major' },
  { value: 'F', label: 'F Major' },
  { value: 'Bb', label: 'Bb Major' },
  { value: 'Eb', label: 'Eb Major' },
  { value: 'Ab', label: 'Ab Major' },
  { value: 'Db', label: 'Db Major' },
  { value: 'Gb', label: 'Gb Major' },
];

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
  keySignature: string;
  pitchSyllableSystem: string;
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
  onKeySignatureChange: (value: string) => void;
  onPitchSyllableSystemChange: (system: string) => void;
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
  keySignature,
  pitchSyllableSystem,
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
  onKeySignatureChange,
  onPitchSyllableSystemChange,
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
                    {SIGHT_READING_PRESETS[preset].name}
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

          {/* Start Measure & Syllable System */}
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

            {/* Syllable System */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={pitchSyllableSystem}
                    onValueChange={onPitchSyllableSystemChange}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No syllables</SelectItem>
                      <SelectItem value="moveableDo">Moveable Do</SelectItem>
                      <SelectItem value="fixedDo">Fixed Do</SelectItem>
                      <SelectItem value="scaleDegrees">Scale Degrees</SelectItem>
                      <SelectItem value="noteNames">Note Names</SelectItem>
                      <SelectItem value="kodaly">Kodály (ta, ti-ti)</SelectItem>
                      <SelectItem value="takadimi">Takadimi</SelectItem>
                      <SelectItem value="gordon">Gordon</SelectItem>
                      <SelectItem value="numbers">Numbers (1 e & a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose syllable naming system for notes</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Main Controls Bar (Always Visible) */}
      <div className="bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
          {/* Left Section: Expand + Key + Regenerate */}
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
                  <Select value={keySignature} onValueChange={onKeySignatureChange}>
                    <SelectTrigger className="h-9 w-[110px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KEY_SIGNATURES.map((key) => (
                        <SelectItem key={key.value} value={key.value}>
                          {key.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Key signature</p>
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
                <p>Generate new exercise</p>
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
                  <p>Play the exercise</p>
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
