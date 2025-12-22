/**
 * Grid Notation Component
 * Simplified visual representation of rhythm patterns
 */

import { RhythmPattern, RhythmEvent, NOTE_DURATIONS, REST_DURATIONS } from '@/lib/rhythmRandomizer/types';

interface GridNotationProps {
  pattern: RhythmPattern;
  currentEventIndex?: number;
  isPlaying?: boolean;
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

function getEventWidth(event: RhythmEvent): string {
  // Width based on duration (quarter note = 1 unit = 60px)
  const duration = event.type === 'note'
    ? NOTE_DURATIONS[event.value as keyof typeof NOTE_DURATIONS] || 1
    : REST_DURATIONS[event.value as keyof typeof REST_DURATIONS] || 1;

  const baseWidth = 60;
  const width = Math.max(20, duration * baseWidth);
  return `${width}px`;
}

function getNoteSymbol(event: RhythmEvent): string {
  if (event.type === 'rest') {
    return '𝄽'; // Rest symbol
  }

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

  return symbols[event.value] || '♩';
}

export function GridNotation({ pattern, currentEventIndex = -1, isPlaying = false }: GridNotationProps) {
  let globalEventIndex = 0;

  return (
    <div className="space-y-4">
      {pattern.measures.map((measure, measureIndex) => (
        <div key={measureIndex} className="flex items-center gap-2">
          {/* Measure number */}
          <div className="w-8 text-center text-sm font-medium text-gray-500">
            {measure.measureNumber}
          </div>

          {/* Beat grid */}
          <div className="flex-1 flex items-center gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
            {measure.events.map((event, eventIndex) => {
              const eventGlobalIndex = globalEventIndex++;
              const isActive = isPlaying && eventGlobalIndex === currentEventIndex;

              return (
                <div
                  key={eventIndex}
                  className={`
                    relative flex items-center justify-center
                    h-12 rounded transition-all duration-100
                    ${getNoteColor(event, isActive)}
                    ${isActive ? 'ring-2 ring-purple-600 ring-offset-1 scale-105' : ''}
                    ${event.type === 'rest' ? 'opacity-50' : ''}
                  `}
                  style={{ width: getEventWidth(event) }}
                  title={`${event.type}: ${event.value}`}
                >
                  <span className={`text-lg ${event.type === 'rest' ? 'text-gray-500' : 'text-white'}`}>
                    {getNoteSymbol(event)}
                  </span>

                  {/* Accent indicator */}
                  {event.isAccented && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs">
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
            })}
          </div>

          {/* Measure barline */}
          <div className="w-1 h-12 bg-gray-400 rounded" />
        </div>
      ))}

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
