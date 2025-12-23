/**
 * Staff Notation Component
 * Renders rhythm patterns using VexFlow staff notation
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { RhythmPattern, CountingSystem } from '@/lib/rhythmRandomizer/types';
import { renderPatternToDiv, expandBeamedGroups } from '@/lib/rhythmRandomizer/rhythmNotation';
import { getSyllableForEvent } from '@/lib/rhythmRandomizer/countingSyllables';

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const syllablesRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) {
        setContainerWidth(wrapperRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Render the notation whenever pattern, highlight, or container width changes
  const renderNotation = useCallback(() => {
    if (!containerRef.current || containerWidth === 0) return;

    renderPatternToDiv(containerRef.current, pattern, {
      containerWidth: containerWidth,
      highlightEventIndex: isPlaying ? currentEventIndex : undefined,
    });
  }, [pattern, currentEventIndex, isPlaying, containerWidth]);

  // Initial render and re-render on changes
  useEffect(() => {
    renderNotation();
  }, [renderNotation]);

  // Calculate syllable positions
  const syllables = showSyllables ? getSyllablesWithPositions(pattern) : [];

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* VexFlow notation container */}
      <div
        ref={containerRef}
        className="w-full"
        style={{ minHeight: '120px' }}
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
 * Uses expanded events to match playback indices (beamed groups are expanded)
 * Regenerates syllables for expanded events using the pattern's counting system
 */
function getSyllablesWithPositions(pattern: RhythmPattern): SyllablePosition[] {
  const positions: SyllablePosition[] = [];
  let globalIndex = 0;
  const countingSystem: CountingSystem = pattern.settings?.countingSystem || 'none';

  pattern.measures.forEach((measure, measureIndex) => {
    // Expand beamed groups to match playback indices
    const expandedEvents = expandBeamedGroups(measure.events);
    let beatPosition = 0;

    expandedEvents.forEach((event) => {
      // Generate syllable for the expanded event based on its beat position
      const syllable = getSyllableForEvent(event, beatPosition, beatPosition, countingSystem);

      if (syllable && countingSystem !== 'none') {
        positions.push({
          syllable,
          globalIndex,
          measureIndex,
        });
      }

      // Advance beat position by the event's duration
      beatPosition += event.duration;
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
