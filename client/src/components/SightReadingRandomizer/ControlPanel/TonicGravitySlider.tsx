/**
 * Tonic Gravity Slider Component
 * Adjusts how strongly the melody gravitates toward the tonic note
 */

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface TonicGravitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function TonicGravitySlider({ value, onChange }: TonicGravitySliderProps) {
  // Determine the label based on value
  const getGravityLabel = (val: number): string => {
    if (val === 0) return 'Off';
    if (val <= 25) return 'Low';
    if (val <= 50) return 'Moderate';
    if (val <= 75) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Tonic Gravity</Label>
        <span className="text-xs text-gray-500 font-medium">
          {getGravityLabel(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={0}
        max={100}
        step={5}
        className="w-full"
      />
      <p className="text-xs text-gray-500">
        Higher values make melodies revolve more around the tonic (root note) of the key
      </p>
    </div>
  );
}
