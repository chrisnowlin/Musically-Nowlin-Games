/**
 * Playback Controls Component
 * Play/Stop/Pause, Loop, Count-in, Metronome, Volume controls
 */

import { Play, Square, Pause, Repeat, Volume2, VolumeX } from 'lucide-react';
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
import { PlaybackState } from '@/lib/rhythmRandomizer/types';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  isReady: boolean;
  hasPattern: boolean;
  loopEnabled: boolean;
  countInMeasures: 0 | 1 | 2;
  metronomeEnabled: boolean;
  volume: number;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onLoopChange: (enabled: boolean) => void;
  onCountInChange: (measures: 0 | 1 | 2) => void;
  onMetronomeChange: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
}

export function PlaybackControls({
  playbackState,
  isReady,
  hasPattern,
  loopEnabled,
  countInMeasures,
  metronomeEnabled,
  volume,
  onPlay,
  onStop,
  onPause,
  onResume,
  onLoopChange,
  onCountInChange,
  onMetronomeChange,
  onVolumeChange,
}: PlaybackControlsProps) {
  const { isPlaying, isPaused } = playbackState;
  const canPlay = hasPattern && isReady;

  return (
    <div className="space-y-4">
      {/* Main Transport Controls */}
      <div className="flex items-center justify-center gap-2">
        {!isPlaying && !isPaused && (
          <Button
            onClick={onPlay}
            disabled={!canPlay}
            size="lg"
            className="gap-2 min-w-[100px]"
          >
            <Play className="w-5 h-5" />
            Play
          </Button>
        )}

        {isPlaying && (
          <>
            <Button
              onClick={onPause}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <Pause className="w-5 h-5" />
              Pause
            </Button>
            <Button
              onClick={onStop}
              size="lg"
              variant="destructive"
              className="gap-2"
            >
              <Square className="w-5 h-5" />
              Stop
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button
              onClick={onResume}
              size="lg"
              className="gap-2 min-w-[100px]"
            >
              <Play className="w-5 h-5" />
              Resume
            </Button>
            <Button
              onClick={onStop}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <Square className="w-5 h-5" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Secondary Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Loop Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Repeat className={`w-4 h-4 ${loopEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
            <Label htmlFor="loop-toggle" className="text-sm">Loop</Label>
          </div>
          <Switch
            id="loop-toggle"
            checked={loopEnabled}
            onCheckedChange={onLoopChange}
          />
        </div>

        {/* Metronome Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full border-2 ${metronomeEnabled ? 'border-purple-600 bg-purple-600' : 'border-gray-400'}`} />
            <Label htmlFor="metronome-toggle" className="text-sm">Click</Label>
          </div>
          <Switch
            id="metronome-toggle"
            checked={metronomeEnabled}
            onCheckedChange={onMetronomeChange}
          />
        </div>
      </div>

      {/* Count-in Selector */}
      <div className="flex items-center gap-3">
        <Label htmlFor="count-in" className="text-sm whitespace-nowrap">Count-in:</Label>
        <Select
          value={String(countInMeasures)}
          onValueChange={(value) => onCountInChange(Number(value) as 0 | 1 | 2)}
        >
          <SelectTrigger id="count-in" className="w-full">
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
      <div className="flex items-center gap-3">
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
  );
}
