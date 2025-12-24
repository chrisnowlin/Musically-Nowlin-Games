/**
 * Density Controls Component
 * Sliders for syncopation, density, rest probability
 */

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NoteDensity } from '@/lib/rhythmRandomizerV3/types';

interface DensityControlsProps {
  syncopation: number;
  density: NoteDensity;
  restProbability: number;
  onSyncopationChange: (value: number) => void;
  onDensityChange: (value: NoteDensity) => void;
  onRestProbabilityChange: (value: number) => void;
}

const DENSITY_OPTIONS: { value: NoteDensity; label: string; description: string }[] = [
  { value: 'sparse', label: 'Sparse', description: 'Longer note values' },
  { value: 'medium', label: 'Medium', description: 'Balanced mix' },
  { value: 'dense', label: 'Dense', description: 'Shorter note values' },
];

export function DensityControls({
  syncopation,
  density,
  restProbability,
  onSyncopationChange,
  onDensityChange,
  onRestProbabilityChange,
}: DensityControlsProps) {
  return (
    <div className="space-y-4">
      {/* Density Selector */}
      <div className="space-y-2">
        <Label htmlFor="density">Note Density</Label>
        <Select value={density} onValueChange={(v) => onDensityChange(v as NoteDensity)}>
          <SelectTrigger id="density" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DENSITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Syncopation Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="syncopation">Syncopation</Label>
          <span className="text-xs text-gray-500">{syncopation}%</span>
        </div>
        <Slider
          id="syncopation"
          value={[syncopation]}
          onValueChange={([value]) => onSyncopationChange(value)}
          min={0}
          max={100}
          step={5}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>On-beat</span>
          <span>Off-beat</span>
        </div>
      </div>

      {/* Rest Probability Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="rest-probability">Rest Frequency</Label>
          <span className="text-xs text-gray-500">{restProbability}%</span>
        </div>
        <Slider
          id="rest-probability"
          value={[restProbability]}
          onValueChange={([value]) => onRestProbabilityChange(value)}
          min={0}
          max={50}
          step={5}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>No rests</span>
          <span>Many rests</span>
        </div>
      </div>
    </div>
  );
}
