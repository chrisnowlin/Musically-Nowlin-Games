/**
 * InstrumentStation - Container for an animal musician and their pattern selector
 *
 * State is lifted to parent - this component just displays and handles interactions
 * Positioning/scaling is handled by parent via CSS transform
 */

import { PatternSelector } from './PatternSelector';
import type { Pattern } from '@/lib/aoc-v2/InstrumentPatterns';

interface InstrumentStationProps {
  patterns: Pattern[];
  image: string;
  alt: string;
  selectedPattern: Pattern | null;
  enabled: boolean;
  isPlaying: boolean;
  onSelectPattern: (pattern: Pattern | null) => void;
  onToggleEnabled: () => void;
}

export function InstrumentStation({
  patterns,
  image,
  alt,
  selectedPattern,
  enabled,
  isPlaying,
  onSelectPattern,
  onToggleEnabled,
}: InstrumentStationProps) {
  return (
    <div className={`relative transition-opacity duration-200 ${enabled ? 'opacity-100' : 'opacity-40'}`}>
      {/* Animal musician - click to toggle enabled (works while playing!) */}
      <button
        onClick={onToggleEnabled}
        className={`
          relative
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2
          ${isPlaying && enabled ? 'scale-105' : 'hover:scale-105'}
          cursor-pointer
        `}
        aria-label={enabled ? `Disable ${alt}` : `Enable ${alt}`}
        aria-pressed={enabled}
      >
        <img
          src={image}
          alt={alt}
          className="w-auto h-44"
        />

        {/* Playing indicator */}
        {isPlaying && enabled && (
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <span className="text-3xl animate-bounce">🎵</span>
          </div>
        )}

        {/* Enabled/disabled indicator */}
        {!enabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-60">🚫</span>
          </div>
        )}
      </button>

      {/* Pattern dots - layered on top of image (can change while playing!) */}
      {/* z-40 is above all images (z-10/20/30) so buttons are always clickable */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-40">
        <PatternSelector
          patterns={patterns}
          selectedPattern={selectedPattern}
          onSelectPattern={onSelectPattern}
          disabled={false}
        />
      </div>
    </div>
  );
}

