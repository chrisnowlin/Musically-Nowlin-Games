/**
 * Staff Notation Component
 * Renders rhythm patterns using VexFlow staff notation
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { RhythmPattern, CountingSystem, StaffLineMode, StemDirection, ClefType } from '@/lib/rhythmRandomizer/types';
import { renderPatternToDiv, expandBeamedGroups, NotePosition } from '@/lib/rhythmRandomizer/rhythmNotation';
import { getSyllableForEvent } from '@/lib/rhythmRandomizer/countingSyllables';
import type { KeySignature, PitchSyllableSystem } from '@/lib/sightReadingRandomizer/types';
import { isPitchSyllableSystem, isRhythmSyllableSystem } from '@/lib/sightReadingRandomizer/types';
import { getPitchSyllable } from '@/lib/sightReadingRandomizer/solfegeSyllables';

interface StaffNotationProps {
  pattern: RhythmPattern;
  currentEventIndex?: number;
  isPlaying?: boolean;
  showSyllables?: boolean;
  countingSystem?: CountingSystem;
  staffLineMode?: StaffLineMode;
  stemDirection?: StemDirection;
  clef?: ClefType;
  keySignature?: string; // VexFlow key signature string (e.g., 'G', 'Bb')
  // Pitch syllable settings
  pitchSyllableSystem?: PitchSyllableSystem;
  keySignatureForSolfege?: KeySignature; // Key signature for solfege calculation
}

export function StaffNotation({
  pattern,
  currentEventIndex = -1,
  isPlaying = false,
  showSyllables = true,
  countingSystem: countingSystemProp,
  staffLineMode = 'single',
  stemDirection = 'up',
  clef = 'treble',
  keySignature,
  pitchSyllableSystem = 'none',
  keySignatureForSolfege,
}: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [notePositions, setNotePositions] = useState<NotePosition[]>([]);

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

    const result = renderPatternToDiv(containerRef.current, pattern, {
      containerWidth: containerWidth,
      highlightEventIndex: isPlaying ? currentEventIndex : undefined,
      staffLineMode: staffLineMode,
      stemDirection: stemDirection,
      clef: clef,
      keySignature: keySignature,
    });

    setNotePositions(result.notePositions);
  }, [pattern, currentEventIndex, isPlaying, containerWidth, staffLineMode, stemDirection, clef, keySignature]);

  // Initial render and re-render on changes
  useEffect(() => {
    renderNotation();
  }, [renderNotation]);

  // Use prop if provided, otherwise fall back to pattern.settings
  const countingSystem: CountingSystem = countingSystemProp ?? pattern.settings?.countingSystem ?? 'none';

  // Determine which syllable mode to use
  const shouldShowPitchSyllables = pitchSyllableSystem && isPitchSyllableSystem(pitchSyllableSystem) && keySignatureForSolfege;
  const shouldShowRhythmSyllables = pitchSyllableSystem && isRhythmSyllableSystem(pitchSyllableSystem);

  // Calculate syllables with their positions from note X coordinates
  // Priority: pitchSyllableSystem setting takes precedence
  const syllablesWithPositions = showSyllables
    ? shouldShowPitchSyllables
      ? getPitchSyllablesWithNotePositions(pattern, notePositions, pitchSyllableSystem!, keySignatureForSolfege!)
      : shouldShowRhythmSyllables
        ? getSyllablesWithNotePositions(pattern, notePositions, pitchSyllableSystem as CountingSystem)
        : getSyllablesWithNotePositions(pattern, notePositions, countingSystem)
    : [];

  // Group syllables by line (Y position)
  const syllablesByLine = groupSyllablesByLine(syllablesWithPositions);

  // Calculate average note spacing to determine font size
  const avgSpacing = calculateAverageSpacing(notePositions);
  // Use smaller font for dense patterns (spacing < 30px)
  const isDense = avgSpacing > 0 && avgSpacing < 30;
  const isVeryDense = avgSpacing > 0 && avgSpacing < 20;

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      {/* VexFlow notation container with syllables positioned absolutely within */}
      <div
        ref={containerRef}
        className="w-full relative"
        style={{ minHeight: '80px' }}
      />

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

/**
 * Extract pitch syllables from pattern with their X positions from VexFlow
 * Uses expanded events to match playback indices (beamed groups are expanded)
 */
function getPitchSyllablesWithNotePositions(
  pattern: RhythmPattern,
  notePositions: NotePosition[],
  pitchSyllableSystem: PitchSyllableSystem,
  keySignature: KeySignature
): SyllableWithPosition[] {
  const positions: SyllableWithPosition[] = [];
  let globalIndex = 0;

  if (pitchSyllableSystem === 'none') {
    return [];
  }

  pattern.measures.forEach((measure, measureIndex) => {
    // Expand beamed groups to match playback indices
    const expandedEvents = expandBeamedGroups(measure.events);

    expandedEvents.forEach((event) => {
      // Find the note position for this global index
      const notePos = notePositions.find((p) => p.globalIndex === globalIndex);

      // Only show syllables for notes (not rests)
      if (event.type === 'note' && notePos) {
        // Generate pitch syllable from the event's pitch
        const syllable = getPitchSyllable(event.pitch, keySignature, pitchSyllableSystem);

        if (syllable) {
          positions.push({
            syllable,
            globalIndex,
            measureIndex,
            x: notePos.x,
            y: notePos.y,
          });
        }
      }

      globalIndex++;
    });
  });

  return positions;
}
