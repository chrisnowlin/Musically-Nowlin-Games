/**
 * Floating Playback Overlay Component
 * Compact floating playback controls with expandable advanced options
 */

import { useState } from 'react';
import { Play, Square, Pause, Volume2, VolumeX, Repeat, Timer, ChevronUp, ChevronDown, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  staffLineMode: 'single' | 'full';
  onStaffLineModeChange: (mode: 'single' | 'full') => void;
  pitchSyllableSystem: string;
  onPitchSyllableSystemChange: (system: string) => void;
}

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
  staffLineMode,
  onStaffLineModeChange,
  pitchSyllableSystem,
  onPitchSyllableSystemChange,
}: FloatingPlaybackOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isPlaying, isPaused, isMetronomePlaying } = playbackState;
  const canPlay = hasPattern && isReady;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-200">
        {/* Main Controls Bar (Always Visible) - Single Row */}
        <div className="px-4 py-2 flex items-center justify-between gap-4">
          {/* Left: Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 h-9 w-9 shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </Button>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2">
            {!isPlaying && !isPaused && (
              <Button
                onClick={onPlay}
                disabled={!canPlay}
                className="gap-2 h-9"
              >
                <Play className="w-4 h-4" />
                Play
              </Button>
            )}

            {isPlaying && (
              <>
                <Button
                  onClick={onPause}
                  variant="outline"
                  className="gap-2 h-9"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
                <Button
                  onClick={onStop}
                  variant="destructive"
                  className="h-9 px-3"
                >
                  <Square className="w-4 h-4" />
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button
                  onClick={onResume}
                  className="gap-2 h-9"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
                <Button
                  onClick={onStop}
                  variant="outline"
                  className="h-9 px-3"
                >
                  <Square className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Right: Volume & Quick Toggles */}
          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-2 w-32">
              <button
                onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
                className="p-1 hover:bg-gray-100 rounded shrink-0"
              >
                {volume > 0 ? (
                  <Volume2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <Slider
                value={[volume * 100]}
                onValueChange={([value]) => onVolumeChange(value / 100)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
            </div>

            {/* Loop */}
            <div className="flex items-center gap-1.5">
              <Repeat className={`w-4 h-4 ${loopEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
              <Switch
                checked={loopEnabled}
                onCheckedChange={onLoopChange}
                className="scale-90"
              />
            </div>

            {/* Click Track */}
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full border-2 ${metronomeEnabled ? 'border-purple-600 bg-purple-600' : 'border-gray-400'}`} />
              <Switch
                checked={metronomeEnabled}
                onCheckedChange={onMetronomeChange}
                className="scale-90"
              />
            </div>
          </div>
        </div>

        {/* Expanded Section (Slide up when expanded) */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-100">
            {/* Tempo & Metronome */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={isMetronomePlaying ? onStopMetronome : onPlayMetronome}
                variant={isMetronomePlaying ? 'destructive' : 'outline'}
                size="sm"
                disabled={!isReady}
                className="gap-1.5"
              >
                <Timer className={`w-4 h-4 ${isMetronomePlaying ? 'animate-pulse' : ''}`} />
                {isMetronomePlaying ? 'Stop' : `${tempo} BPM`}
              </Button>

              <Select
                value={String(countInMeasures)}
                onValueChange={(value) => onCountInChange(Number(value) as 0 | 1 | 2)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No count-in</SelectItem>
                  <SelectItem value="1">1 measure</SelectItem>
                  <SelectItem value="2">2 measures</SelectItem>
                  <SelectItem value="3">3 measures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Measure */}
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
                    {i + 1 === 1 ? 'From beginning' : `From measure ${i + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Display Options */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStaffLineModeChange(staffLineMode === 'single' ? 'full' : 'single')}
                className="gap-1.5"
              >
                <Music className="w-3.5 h-3.5" />
                {staffLineMode === 'single' ? '5 Lines' : '1 Line'}
              </Button>

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
          </div>
        )}
      </div>
    </div>
  );
}
