import { NOTE_FREQS, NOTES, getNoteName } from './finish-the-tune-Logic';
import { PITCH_COLORS, type NoteEvent } from './types';

interface MelodyVisualizerProps {
  notes: NoteEvent[];
  activeIndex: number;
  isPlaying: boolean;
  className?: string;
  showTonic?: boolean;
  showNoteNames?: boolean;
  compact?: boolean;
}

export function MelodyVisualizer({
  notes,
  activeIndex,
  isPlaying,
  className = "",
  showTonic = true,
  showNoteNames = false,
  compact = false,
}: MelodyVisualizerProps) {
  return (
    <div className={`flex items-end justify-center gap-1 bg-white/50 dark:bg-black/20 rounded-xl backdrop-blur-sm relative ${compact ? 'h-16' : 'min-h-[120px]'} p-3 ${className}`}>
      {/* Tonic Line Indicator */}
      {showTonic && (
        <div
          className="absolute bottom-[20%] left-0 w-full h-0.5 bg-green-400/30 border-t border-dashed border-green-500/50 pointer-events-none"
          title="Home Note Level"
        />
      )}

      {notes.map((note, index) => {
        const noteIndex = NOTE_FREQS.indexOf(note.freq);
        const heightPercent = noteIndex === -1 ? 0 : 20 + (noteIndex / (NOTE_FREQS.length - 1)) * 80;
        const isActive = isPlaying && index === activeIndex;
        const isTonic = showTonic && (note.freq === NOTES.C || note.freq === NOTES.C2);
        const noteName = getNoteName(note.freq);
        const noteColor = PITCH_COLORS[noteName] || '#94a3b8';

        const widthClass = note.duration <= 0.25 ? 'flex-[1]' : note.duration <= 0.45 ? 'flex-[2]' : 'flex-[3]';
        const sizeClass = compact ? 'w-4 h-4 md:w-5 md:h-5 border-[1.5px]' : 'w-6 h-6 md:w-8 md:h-8 border-2';

        return (
          <div key={index} className={`${widthClass} flex flex-col items-center justify-end h-full gap-1 group relative`}>
            {/* Note Head */}
            <div
              className={`
                rounded-full transition-all duration-200 shadow-sm z-10 relative flex items-center justify-center
                ${isActive
                  ? 'scale-125 shadow-lg translate-y-[-4px] ring-2 ring-purple-400 ring-offset-1'
                  : ''
                }
                ${sizeClass}
              `}
              style={{
                marginBottom: `${heightPercent * (compact ? 0.4 : 0.8)}px`,
                backgroundColor: isActive ? '#a855f7' : isTonic ? '#4ade80' : noteColor,
                borderColor: isActive ? '#9333ea' : isTonic ? '#22c55e' : noteColor,
                boxShadow: isActive ? `0 4px 12px ${noteColor}80` : undefined,
              }}
            >
              {/* Note Name Label */}
              {showNoteNames && !compact && (
                <span
                  className={`
                    text-[9px] md:text-[10px] font-bold text-white
                    ${isActive ? 'opacity-100' : 'opacity-90'}
                  `}
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {noteName.replace('2', '')}
                </span>
              )}
            </div>

            {/* Rhythm Bar */}
            <div
              className={`h-1 bg-gray-300 dark:bg-gray-600 rounded-full mt-1 ${note.duration > 0.4 ? 'w-full' : 'w-1/2'}`}
              style={{ opacity: 0.5 }}
            />

            {/* Note Name Below (for compact view or as alternative) */}
            {showNoteNames && compact && (
              <span className="text-[8px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                {noteName.replace('2', '')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MelodyVisualizer;
