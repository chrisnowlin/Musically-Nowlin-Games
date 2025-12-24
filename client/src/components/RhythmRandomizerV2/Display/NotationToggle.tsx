/**
 * Notation Toggle Component
 * Switch between staff notation and grid notation modes
 */

import { Music, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotationMode } from '@/lib/rhythmRandomizerV2/types';

interface NotationToggleProps {
  value: NotationMode;
  onChange: (mode: NotationMode) => void;
}

export function NotationToggle({ value, onChange }: NotationToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={value === 'staff' ? 'default' : 'ghost'}
        size="sm"
        className={`gap-1.5 h-8 px-3 ${
          value === 'staff'
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'hover:bg-gray-200 text-gray-600'
        }`}
        onClick={() => onChange('staff')}
      >
        <Music className="w-4 h-4" />
        <span className="text-xs font-medium">Staff</span>
      </Button>
      <Button
        variant={value === 'grid' ? 'default' : 'ghost'}
        size="sm"
        className={`gap-1.5 h-8 px-3 ${
          value === 'grid'
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'hover:bg-gray-200 text-gray-600'
        }`}
        onClick={() => onChange('grid')}
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="text-xs font-medium">Grid</span>
      </Button>
    </div>
  );
}
