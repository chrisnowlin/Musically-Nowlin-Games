/**
 * Tempo Control Component with BPM slider and tap tempo
 */

import { useState, useCallback, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TempoControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const TEMPO_MARKINGS = [
  { bpm: 40, label: 'Largo' },
  { bpm: 60, label: 'Adagio' },
  { bpm: 80, label: 'Andante' },
  { bpm: 100, label: 'Moderato' },
  { bpm: 120, label: 'Allegro' },
  { bpm: 140, label: 'Vivace' },
  { bpm: 180, label: 'Presto' },
];

function getTempoMarking(bpm: number): string {
  for (let i = TEMPO_MARKINGS.length - 1; i >= 0; i--) {
    if (bpm >= TEMPO_MARKINGS[i].bpm) {
      return TEMPO_MARKINGS[i].label;
    }
  }
  return 'Largo';
}

export function TempoControl({
  value,
  onChange,
  min = 40,
  max = 208,
}: TempoControlProps) {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const lastTapRef = useRef<number>(0);

  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    // Reset if more than 2 seconds since last tap
    if (timeSinceLastTap > 2000) {
      setTapTimes([now]);
      lastTapRef.current = now;
      return;
    }

    const newTapTimes = [...tapTimes, now].slice(-5); // Keep last 5 taps
    setTapTimes(newTapTimes);
    lastTapRef.current = now;

    // Calculate average BPM from tap intervals
    if (newTapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < newTapTimes.length; i++) {
        intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgInterval);
      const clampedBpm = Math.max(min, Math.min(max, bpm));
      onChange(clampedBpm);
    }
  }, [tapTimes, onChange, min, max]);

  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="tempo">Tempo</Label>
        <span className="text-xs text-gray-500">{getTempoMarking(value)}</span>
      </div>

      <div className="flex items-center gap-3">
        <Slider
          id="tempo"
          value={[value]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={1}
          className="flex-1"
        />
        <Input
          type="number"
          value={value}
          onChange={handleInputChange}
          className="w-20 text-center"
          min={min}
          max={max}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleTapTempo}
        className="w-full"
      >
        Tap Tempo
      </Button>
    </div>
  );
}
