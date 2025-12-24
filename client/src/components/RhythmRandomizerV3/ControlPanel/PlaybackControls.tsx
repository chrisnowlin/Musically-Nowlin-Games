/**
 * Playback Controls Component
 * Play/Stop/Pause, Loop, Count-in, Metronome, Volume controls
 */

import { Play, Square, Pause, Repeat, Volume2, VolumeX, Timer, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlaybackState } from '@/lib/rhythmRandomizerV3/types';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
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
}

export function PlaybackControls({
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
}: PlaybackControlsProps) {
  const { isPlaying, isPaused, isMetronomePlaying } = playbackState;
  const canPlay = hasPattern && isReady;

  return (
    <div className="space-y-3">
      {/* Main Transport Controls */}
      <div className="flex items-center justify-center gap-2">
        {!isPlaying && !isPaused && (
          <div className="flex items-center">
            {/* Main play button */}
            <Button
              onClick={onPlay}
              disabled={!canPlay}
              size="default"
              className="gap-2 rounded-r-none border-r border-primary-foreground/20 h-9"
            >
              <Play className="w-4 h-4" />
              {startMeasure === 1 ? 'Play' : `Play from m.${startMeasure}`}
            </Button>
            {/* Dropdown trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={!canPlay}
                  size="default"
                  className="px-2 rounded-l-none -ml-px h-9"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Array.from({ length: measureCount }, (_, i) => (
                  <DropdownMenuItem
                    key={i + 1}
                    onClick={() => onStartMeasureChange(i + 1)}
                    className={startMeasure === i + 1 ? 'bg-accent' : ''}
                  >
                    {i + 1 === 1 ? 'From beginning' : `From measure ${i + 1}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {isPlaying && (
          <>
            <Button
              onClick={onPause}
              size="default"
              variant="outline"
              className="gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
            <Button
              onClick={onStop}
              size="default"
              variant="destructive"
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button
              onClick={onResume}
              size="default"
              className="gap-2 min-w-[100px]"
            >
              <Play className="w-4 h-4" />
              Resume
            </Button>
            <Button
              onClick={onStop}
              size="default"
              variant="outline"
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Secondary Controls - Inline */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Standalone Metronome Button */}
        <Button
          onClick={isMetronomePlaying ? onStopMetronome : onPlayMetronome}
          variant={isMetronomePlaying ? 'destructive' : 'outline'}
          size="sm"
          disabled={!isReady}
          className="gap-1.5"
          title={isMetronomePlaying ? 'Stop metronome' : `Start metronome at ${tempo} BPM`}
        >
          <Timer className={`w-4 h-4 ${isMetronomePlaying ? 'animate-pulse' : ''}`} />
          {isMetronomePlaying ? 'Stop' : `${tempo} BPM`}
        </Button>

        {/* Loop Toggle */}
        <div className="flex items-center gap-2">
          <Repeat className={`w-4 h-4 ${loopEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
          <Label htmlFor="loop-toggle" className="text-sm">Loop</Label>
          <Switch
            id="loop-toggle"
            checked={loopEnabled}
            onCheckedChange={onLoopChange}
          />
        </div>

        {/* Click Track Toggle (metronome during playback) */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full border-2 ${metronomeEnabled ? 'border-purple-600 bg-purple-600' : 'border-gray-400'}`} />
          <Label htmlFor="metronome-toggle" className="text-sm whitespace-nowrap">Click Track</Label>
          <Switch
            id="metronome-toggle"
            checked={metronomeEnabled}
            onCheckedChange={onMetronomeChange}
          />
        </div>

        {/* Count-in Selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="count-in" className="text-sm whitespace-nowrap">Count-in:</Label>
          <Select
            value={String(countInMeasures)}
            onValueChange={(value) => onCountInChange(Number(value) as 0 | 1 | 2)}
          >
            <SelectTrigger id="count-in" className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">None</SelectItem>
              <SelectItem value="1">1 measure</SelectItem>
              <SelectItem value="2">2 measures</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
            className="p-1 hover:bg-gray-100 rounded"
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
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
