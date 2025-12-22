/**
 * Staff Notation Component
 * Renders rhythm patterns using VexFlow staff notation
 */

import { useRef, useEffect, useCallback } from 'react';
import { RhythmPattern } from '@/lib/rhythmRandomizer/types';
import { renderPatternToDiv, calculatePatternDimensions } from '@/lib/rhythmRandomizer/rhythmNotation';

interface StaffNotationProps {
  pattern: RhythmPattern;
  currentEventIndex?: number;
  isPlaying?: boolean;
  showSyllables?: boolean;
}

export function StaffNotation({
  pattern,
  currentEventIndex = -1,
  isPlaying = false,
  showSyllables = true,
}: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const syllablesRef = useRef<HTMLDivElement>(null);

  // Render the notation whenever pattern or highlight changes
  const renderNotation = useCallback(() => {
    if (!containerRef.current) return;

    const dimensions = calculatePatternDimensions(pattern);

    renderPatternToDiv(containerRef.current, pattern, {
      width: dimensions.width,
      height: dimensions.height,
      highlightEventIndex: isPlaying ? currentEventIndex : undefined,
    });
  }, [pattern, currentEventIndex, isPlaying]);

  // Initial render and re-render on changes
  useEffect(() => {
    renderNotation();
  }, [renderNotation]);

  // Calculate syllable positions
  const syllables = showSyllables ? getSyllablesWithPositions(pattern) : [];

  return (
    <div className="relative w-full overflow-x-auto">
      {/* VexFlow notation container */}
      <div
        ref={containerRef}
        className="min-w-full"
        style={{ minHeight: '150px' }}
      />

      {/* Syllables overlay */}
      {showSyllables && syllables.length > 0 && (
        <div
          ref={syllablesRef}
          className="flex flex-wrap gap-x-1 mt-2 px-2 text-sm text-purple-600 font-medium"
        >
          {syllables.map((item, index) => (
            <span
              key={index}
              className={`
                transition-colors duration-150
                ${currentEventIndex === item.globalIndex && isPlaying
                  ? 'text-purple-800 bg-purple-100 rounded px-1'
                  : ''
                }
              `}
            >
              {item.syllable}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface SyllablePosition {
  syllable: string;
  globalIndex: number;
  measureIndex: number;
}

/**
 * Extract syllables from pattern with their global indices
 */
function getSyllablesWithPositions(pattern: RhythmPattern): SyllablePosition[] {
  const positions: SyllablePosition[] = [];
  let globalIndex = 0;

  pattern.measures.forEach((measure, measureIndex) => {
    measure.events.forEach((event) => {
      if (event.syllable) {
        positions.push({
          syllable: event.syllable,
          globalIndex,
          measureIndex,
        });
      }
      globalIndex++;
    });

    // Add measure separator
    if (measureIndex < pattern.measures.length - 1) {
      positions.push({
        syllable: '|',
        globalIndex: -1, // Not highlightable
        measureIndex,
      });
    }
  });

  return positions;
}
