/**
 * Grid Notation Component
 * Simplified visual representation of rhythm patterns with proper beaming
 */

import { RhythmPattern, RhythmEvent, NOTE_DURATIONS, REST_DURATIONS, NoteValue } from '@/lib/rhythmRandomizer/types';

interface GridNotationProps {
  pattern: RhythmPattern;
  currentEventIndex?: number;
  isPlaying?: boolean;
}

// Note values that can be beamed together (eighth-level)
const EIGHTH_BEAMABLE: Set<string> = new Set([
  'eighth', 'dottedEighth', 'tripletEighth'
]);

// Sixteenth notes
const SIXTEENTH_BEAMABLE: Set<string> = new Set([
  'sixteenth'
]);

// Check if a note value can be beamed
function isBeamable(event: RhythmEvent): boolean {
  return event.type === 'note' && (EIGHTH_BEAMABLE.has(event.value as string) || SIXTEENTH_BEAMABLE.has(event.value as string));
}

// Check if it's a sixteenth note
function isSixteenth(event: RhythmEvent): boolean {
  return event.type === 'note' && SIXTEENTH_BEAMABLE.has(event.value as string);
}

// Group events into beam groups and single events
interface EventGroup {
  type: 'single' | 'beamGroup';
  events: RhythmEvent[];
  startIndex: number; // Global event index of first event in group
}

function groupEventsForBeaming(events: RhythmEvent[], startGlobalIndex: number): EventGroup[] {
  const groups: EventGroup[] = [];
  let i = 0;
  let globalIdx = startGlobalIndex;

  while (i < events.length) {
    const event = events[i];

    if (isBeamable(event)) {
      // Start a beam group - collect consecutive beamable notes
      const beamGroup: RhythmEvent[] = [event];
      const groupStartIndex = globalIdx;
      i++;
      globalIdx++;

      while (i < events.length && isBeamable(events[i])) {
        beamGroup.push(events[i]);
        i++;
        globalIdx++;
      }

      // Only beam if there are 2+ notes, otherwise treat as single
      if (beamGroup.length >= 2) {
        groups.push({ type: 'beamGroup', events: beamGroup, startIndex: groupStartIndex });
      } else {
        groups.push({ type: 'single', events: beamGroup, startIndex: groupStartIndex });
      }
    } else {
      // Single event (not beamable)
      groups.push({ type: 'single', events: [event], startIndex: globalIdx });
      i++;
      globalIdx++;
    }
  }

  return groups;
}

function getNoteColor(event: RhythmEvent, isActive: boolean): string {
  if (isActive) {
    return 'bg-purple-500';
  }
  if (event.type === 'rest') {
    return 'bg-gray-200';
  }
  if (event.isAccented) {
    return 'bg-orange-400';
  }
  return 'bg-purple-300';
}

function getEventWidth(event: RhythmEvent): number {
  // Width based on duration (quarter note = 1 unit = 60px)
  const duration = event.type === 'note'
    ? NOTE_DURATIONS[event.value as keyof typeof NOTE_DURATIONS] || 1
    : REST_DURATIONS[event.value as keyof typeof REST_DURATIONS] || 1;

  const baseWidth = 60;
  return Math.max(20, duration * baseWidth);
}

function getRestSymbol(value: string): string {
  const restSymbols: Record<string, string> = {
    wholeRest: '𝄻',
    halfRest: '𝄼',
    quarterRest: '𝄽',
    eighthRest: '𝄾',
    sixteenthRest: '𝄿',
  };
  return restSymbols[value] || '𝄽';
}

function getSingleNoteSymbol(value: string): string {
  // Symbols for notes that are NOT beamed (use flags)
  const symbols: Record<string, string> = {
    whole: '𝅝',
    half: '𝅗𝅥',
    quarter: '♩',
    eighth: '♪',
    sixteenth: '𝅘𝅥𝅯',
    dottedHalf: '𝅗𝅥.',
    dottedQuarter: '♩.',
    dottedEighth: '♪.',
    tripletQuarter: '³',
    tripletEighth: '³',
  };
  return symbols[value] || '♩';
}

// Render a single event (not beamed)
function SingleEvent({
  event,
  isActive,
  isPlaying,
}: {
  event: RhythmEvent;
  isActive: boolean;
  isPlaying: boolean;
}) {
  const symbol = event.type === 'rest'
    ? getRestSymbol(event.value as string)
    : getSingleNoteSymbol(event.value as string);

  return (
    <div
      className={`
        relative flex items-center justify-center
        h-12 rounded transition-all duration-100
        ${getNoteColor(event, isActive)}
        ${isActive ? 'ring-2 ring-purple-600 ring-offset-1 scale-105' : ''}
        ${event.type === 'rest' ? 'opacity-50' : ''}
      `}
      style={{ width: `${getEventWidth(event)}px` }}
      title={`${event.type}: ${event.value}`}
    >
      <span className={`text-lg ${event.type === 'rest' ? 'text-gray-500' : 'text-white'}`}>
        {symbol}
      </span>

      {/* Accent indicator */}
      {event.isAccented && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700">
          &gt;
        </div>
      )}

      {/* Syllable */}
      {event.syllable && (
        <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-600">
          {event.syllable}
        </div>
      )}
    </div>
  );
}

// Get the beamed symbol for a pair of notes
function getBeamedPairSymbol(event1: RhythmEvent, event2: RhythmEvent): string {
  // If either note is a sixteenth, use sixteenth beam symbol
  if (isSixteenth(event1) || isSixteenth(event2)) {
    return '♬'; // Beamed sixteenth notes
  }
  return '♫'; // Beamed eighth notes
}

// Render a group of beamed notes using Unicode symbols
function BeamGroup({
  events,
  startIndex,
  currentEventIndex,
  isPlaying,
}: {
  events: RhythmEvent[];
  startIndex: number;
  currentEventIndex: number;
  isPlaying: boolean;
}) {
  // Create pairs for display - each pair shares one beamed symbol
  const pairs: { events: RhythmEvent[]; pairStartIndex: number }[] = [];
  for (let i = 0; i < events.length; i += 2) {
    if (i + 1 < events.length) {
      pairs.push({ events: [events[i], events[i + 1]], pairStartIndex: startIndex + i });
    } else {
      // Odd note at end - treat as single
      pairs.push({ events: [events[i]], pairStartIndex: startIndex + i });
    }
  }

  return (
    <div className="flex items-center gap-1">
      {pairs.map((pair, pairIdx) => {
        if (pair.events.length === 2) {
          // Render as beamed pair
          const [event1, event2] = pair.events;
          const pairWidth = getEventWidth(event1) + getEventWidth(event2) + 4; // 4px gap
          const isFirstActive = isPlaying && pair.pairStartIndex === currentEventIndex;
          const isSecondActive = isPlaying && pair.pairStartIndex + 1 === currentEventIndex;
          const isAnyActive = isFirstActive || isSecondActive;
          const symbol = getBeamedPairSymbol(event1, event2);

          return (
            <div
              key={pairIdx}
              className={`
                relative flex items-center justify-center
                h-12 rounded transition-all duration-100
                ${isAnyActive ? 'bg-purple-500 ring-2 ring-purple-600 ring-offset-1 scale-105' : 'bg-purple-300'}
                ${event1.isAccented || event2.isAccented ? 'bg-orange-400' : ''}
              `}
              style={{ width: `${pairWidth}px` }}
              title={`beamed: ${event1.value} + ${event2.value}`}
            >
              <span className="text-xl text-white">{symbol}</span>

              {/* Accent indicator */}
              {(event1.isAccented || event2.isAccented) && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700">
                  &gt;
                </div>
              )}

              {/* Syllables */}
              <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-600 px-1">
                <span>{event1.syllable || ''}</span>
                <span>{event2.syllable || ''}</span>
              </div>
            </div>
          );
        } else {
          // Single note (odd one at end) - render normally
          const event = pair.events[0];
          const isActive = isPlaying && pair.pairStartIndex === currentEventIndex;
          const symbol = isSixteenth(event) ? '𝅘𝅥𝅯' : '♪';

          return (
            <div
              key={pairIdx}
              className={`
                relative flex items-center justify-center
                h-12 rounded transition-all duration-100
                ${getNoteColor(event, isActive)}
                ${isActive ? 'ring-2 ring-purple-600 ring-offset-1 scale-105' : ''}
              `}
              style={{ width: `${getEventWidth(event)}px` }}
              title={`${event.type}: ${event.value}`}
            >
              <span className="text-lg text-white">{symbol}</span>

              {/* Accent indicator */}
              {event.isAccented && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700">
                  &gt;
                </div>
              )}

              {/* Syllable */}
              {event.syllable && (
                <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-600">
                  {event.syllable}
                </div>
              )}
            </div>
          );
        }
      })}
    </div>
  );
}

export function GridNotation({ pattern, currentEventIndex = -1, isPlaying = false }: GridNotationProps) {
  let globalEventIndex = 0;

  return (
    <div className="space-y-4">
      {pattern.measures.map((measure, measureIndex) => {
        // Group events for beaming
        const groups = groupEventsForBeaming(measure.events, globalEventIndex);
        // Update global index counter
        globalEventIndex += measure.events.length;

        return (
          <div key={measureIndex} className="flex items-center gap-2">
            {/* Measure number */}
            <div className="w-8 text-center text-sm font-medium text-gray-500">
              {measure.measureNumber}
            </div>

            {/* Beat grid */}
            <div className="flex-1 flex items-center gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
              {groups.map((group, groupIndex) => {
                if (group.type === 'beamGroup') {
                  return (
                    <BeamGroup
                      key={groupIndex}
                      events={group.events}
                      startIndex={group.startIndex}
                      currentEventIndex={currentEventIndex}
                      isPlaying={isPlaying}
                    />
                  );
                } else {
                  const event = group.events[0];
                  const isActive = isPlaying && group.startIndex === currentEventIndex;
                  return (
                    <SingleEvent
                      key={groupIndex}
                      event={event}
                      isActive={isActive}
                      isPlaying={isPlaying}
                    />
                  );
                }
              })}
            </div>

            {/* Measure barline */}
            <div className="w-1 h-12 bg-gray-400 rounded" />
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-purple-300 rounded" />
          <span>Note</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <span>Rest</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span>Accent</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-purple-500 rounded ring-2 ring-purple-600" />
          <span>Playing</span>
        </div>
      </div>
    </div>
  );
}
