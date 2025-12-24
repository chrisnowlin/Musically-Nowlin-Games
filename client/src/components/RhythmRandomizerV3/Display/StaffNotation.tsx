/**
 * Staff Notation Component
 * Renders rhythm patterns using VexFlow staff notation
 */

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { RhythmPattern, CountingSystem, StaffLineMode, StemDirection } from '@/lib/rhythmRandomizerV3/types';
import { renderPatternToDiv, expandBeamedGroups, NotePosition } from '@/lib/rhythmRandomizerV3/rhythmNotation';
import { getSyllableForEvent } from '@/lib/rhythmRandomizerV3/countingSyllables';

interface StaffNotationProps {
  pattern: RhythmPattern;
  currentEventIndex?: number;
  isPlaying?: boolean;
  showSyllables?: boolean;
  countingSystem?: CountingSystem;
  staffLineMode?: StaffLineMode;
  stemDirection?: StemDirection;
  onMeasureClick?: (measureNumber: number) => void;
}

export function StaffNotation({
  pattern,
  currentEventIndex = -1,
  isPlaying = false,
  showSyllables = true,
  countingSystem: countingSystemProp,
  staffLineMode = 'single',
  stemDirection = 'up',
  onMeasureClick,
}: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [notePositions, setNotePositions] = useState<NotePosition[]>([]);
  const [hoveredMeasure, setHoveredMeasure] = useState<number | null>(null);

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

  // Calculate effective width for notation - constrain short patterns
  // to prevent overly stretched measures that hurt readability
  const effectiveWidth = useMemo(() => {
    const measureCount = pattern.measures.length;
    if (containerWidth === 0) return 0;

    // For short patterns, use a percentage of container width
    // This prevents single measures from being too stretched
    if (measureCount === 1) {
      return Math.min(containerWidth * 0.35, 400); // 35% or max 400px
    } else if (measureCount === 2) {
      return Math.min(containerWidth * 0.55, 700); // 55% or max 700px
    } else if (measureCount === 3) {
      return Math.min(containerWidth * 0.75, 900); // 75% or max 900px
    }
    // For 4+ measures, use full width
    return containerWidth;
  }, [pattern.measures.length, containerWidth]);

  // Render the notation whenever pattern, highlight, or container width changes
  const renderNotation = useCallback(() => {
    if (!containerRef.current || effectiveWidth === 0) return;

    const result = renderPatternToDiv(containerRef.current, pattern, {
      containerWidth: effectiveWidth,
      highlightEventIndex: isPlaying ? currentEventIndex : undefined,
      staffLineMode: staffLineMode,
      stemDirection: stemDirection,
    });

    setNotePositions(result.notePositions);
  }, [pattern, currentEventIndex, isPlaying, effectiveWidth, staffLineMode, stemDirection]);

  // Initial render and re-render on changes
  useEffect(() => {
    renderNotation();
  }, [renderNotation]);

  // Calculate measure boundaries for click detection
  // Groups note positions by measure and calculates bounding boxes
  const measureBounds = useMemo(() => {
    if (notePositions.length === 0) return [];

    // Group positions by measure
    const positionsByMeasure = new Map<number, NotePosition[]>();
    notePositions.forEach((pos) => {
      if (!positionsByMeasure.has(pos.measureIndex)) {
        positionsByMeasure.set(pos.measureIndex, []);
      }
      positionsByMeasure.get(pos.measureIndex)!.push(pos);
    });

    // Calculate bounds for each measure
    const bounds: Array<{
      measureIndex: number;
      minX: number;
      maxX: number;
      y: number;
    }> = [];

    positionsByMeasure.forEach((positions, measureIndex) => {
      if (positions.length === 0) return;

      const xValues = positions.map((p) => p.x);
      const minX = Math.min(...xValues) - 20; // Add padding before first note
      const maxX = Math.max(...xValues) + 20; // Add padding after last note
      const y = positions[0].y; // Use y position from first note in measure

      bounds.push({ measureIndex, minX, maxX, y });
    });

    return bounds.sort((a, b) => a.measureIndex - b.measureIndex);
  }, [notePositions]);

  // Handle measure click
  const handleMeasureClick = useCallback(
    (measureIndex: number) => {
      if (onMeasureClick) {
        onMeasureClick(measureIndex + 1); // Convert to 1-indexed
      }
    },
    [onMeasureClick]
  );

  // Use prop if provided, otherwise fall back to pattern.settings
  const countingSystem: CountingSystem = countingSystemProp ?? pattern.settings?.countingSystem ?? 'none';

  // Calculate syllables with their positions from note X coordinates
  const syllablesWithPositions = showSyllables
    ? getSyllablesWithNotePositions(pattern, notePositions, countingSystem)
    : [];

  // Group syllables by line (Y position)
  const syllablesByLine = groupSyllablesByLine(syllablesWithPositions);

  // Calculate average note spacing to determine font size
  const avgSpacing = calculateAverageSpacing(notePositions);
  // Use smaller font for dense patterns (spacing < 30px)
  const isDense = avgSpacing > 0 && avgSpacing < 30;
  const isVeryDense = avgSpacing > 0 && avgSpacing < 20;

  return (
    <div ref={wrapperRef} className="relative w-full h-full flex items-center justify-center">
      {/* Centered container for notation + overlays */}
      <div
        className="relative"
        style={{ width: effectiveWidth > 0 ? effectiveWidth : '100%' }}
      >
        {/* VexFlow notation container */}
        <div
          ref={containerRef}
          className="w-full relative"
          style={{ minHeight: '120px' }}
        />

        {/* Clickable measure zones overlay */}
        {onMeasureClick && measureBounds.length > 0 && (
          <div
            className="absolute top-0 left-0 w-full"
            style={{ height: containerRef.current?.clientHeight || 'auto' }}
          >
            {measureBounds.map((bound) => (
              <div
                key={bound.measureIndex}
                className={`
                  absolute cursor-pointer transition-all duration-150
                  ${hoveredMeasure === bound.measureIndex
                    ? 'bg-purple-200/40 border-2 border-purple-400 rounded-md'
                    : 'hover:bg-purple-100/30'
                  }
                `}
                style={{
                  left: `${bound.minX}px`,
                  top: `${bound.y - 60}px`, // Position to cover staff area
                  width: `${bound.maxX - bound.minX}px`,
                  height: '80px', // Height to cover staff
                }}
                onClick={() => handleMeasureClick(bound.measureIndex)}
                onMouseEnter={() => setHoveredMeasure(bound.measureIndex)}
                onMouseLeave={() => setHoveredMeasure(null)}
                title={`Click to play from measure ${bound.measureIndex + 1}`}
              />
            ))}
          </div>
        )}

        {/* Syllables overlay - positioned absolutely to align with notes on each line */}
        {showSyllables && syllablesByLine.length > 0 && (
          <div
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{ height: containerRef.current?.clientHeight || 'auto' }}
          >
            {syllablesByLine.map((line, lineIndex) => (
              <div
                key={lineIndex}
                className="absolute w-full"
                style={{
                  top: `${line.y + 45}px`, // Additional offset to position below staff
                  height: isVeryDense ? '18px' : '24px',
                }}
              >
                {line.syllables.map((item, index) => (
                  <span
                    key={index}
                    className={`
                      absolute text-gray-600 font-medium whitespace-nowrap
                      transition-colors duration-150 -translate-x-1/2 pointer-events-auto
                      ${isVeryDense ? 'text-xs' : isDense ? 'text-xs' : 'text-sm'}
                      ${currentEventIndex === item.globalIndex && isPlaying
                        ? 'text-red-600 bg-red-100 rounded px-0.5'
                        : ''
                      }
                    `}
                    style={{
                      left: `${item.x}px`,
                      top: 0,
                    }}
                  >
                    {isVeryDense ? abbreviateSyllable(item.syllable) : item.syllable}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Calculate average spacing between consecutive notes
 */
function calculateAverageSpacing(positions: NotePosition[]): number {
  if (positions.length < 2) return 100; // Default large spacing

  let totalSpacing = 0;
  let count = 0;

  for (let i = 1; i < positions.length; i++) {
    // Only calculate spacing within the same line (similar y values)
    if (Math.abs(positions[i].y - positions[i - 1].y) < 50) {
      totalSpacing += Math.abs(positions[i].x - positions[i - 1].x);
      count++;
    }
  }

  return count > 0 ? totalSpacing / count : 100;
}

interface SyllableLine {
  y: number;
  syllables: SyllableWithPosition[];
}

/**
 * Group syllables by their Y position (line)
 * Syllables on the same line (within 50px Y tolerance) are grouped together
 */
function groupSyllablesByLine(syllables: SyllableWithPosition[]): SyllableLine[] {
  if (syllables.length === 0) return [];

  const lines: SyllableLine[] = [];
  const tolerance = 50; // Y tolerance for considering syllables on the same line

  for (const syllable of syllables) {
    // Find existing line with similar Y position
    const existingLine = lines.find(
      (line) => Math.abs(line.y - syllable.y) < tolerance
    );

    if (existingLine) {
      existingLine.syllables.push(syllable);
    } else {
      lines.push({
        y: syllable.y,
        syllables: [syllable],
      });
    }
  }

  // Sort lines by Y position (top to bottom)
  lines.sort((a, b) => a.y - b.y);

  return lines;
}

/**
 * Abbreviate syllables for very dense patterns
 */
function abbreviateSyllable(syllable: string): string {
  // Map common syllables to shorter versions
  const abbreviations: Record<string, string> = {
    '(rest)': '–',
    'ta-a-a-a': 'ta',
    'ta-a': 'ta',
    'ti-ka': 'tk',
    'tri-o-la': 'tri',
  };
  return abbreviations[syllable] || syllable;
}

interface SyllableWithPosition {
  syllable: string;
  globalIndex: number;
  measureIndex: number;
  x: number;
  y: number;
}

/**
 * Extract syllables from pattern with their X positions from VexFlow
 * Uses expanded events to match playback indices (beamed groups are expanded)
 * Regenerates syllables for expanded events using the provided counting system
 */
function getSyllablesWithNotePositions(
  pattern: RhythmPattern,
  notePositions: NotePosition[],
  countingSystem: CountingSystem
): SyllableWithPosition[] {
  const positions: SyllableWithPosition[] = [];
  let globalIndex = 0;

  if (countingSystem === 'none') {
    return [];
  }

  pattern.measures.forEach((measure, measureIndex) => {
    // Expand beamed groups to match playback indices
    const expandedEvents = expandBeamedGroups(measure.events);
    let beatPosition = 0;

    expandedEvents.forEach((event) => {
      // Find the note position for this global index
      const notePos = notePositions.find((p) => p.globalIndex === globalIndex);

      // Generate syllable for the expanded event based on its beat position
      const syllable = getSyllableForEvent(event, beatPosition, beatPosition, countingSystem);

      if (syllable && notePos) {
        positions.push({
          syllable,
          globalIndex,
          measureIndex,
          x: notePos.x,
          y: notePos.y,
        });
      }

      // Advance beat position by the event's duration
      beatPosition += event.duration;
      globalIndex++;
    });
  });

  return positions;
}
