import { NOTES, getNoteName } from './finish-the-tune-Logic';
import { PITCH_COLORS } from './types';

interface PianoKeyboardProps {
  activeFrequency: number | null;
  className?: string;
}

// Piano key layout - one octave C to C
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2'];
const BLACK_KEYS: { note: string; position: number }[] = [
  { note: 'C#', position: 1 },
  { note: 'D#', position: 2 },
  { note: 'F#', position: 4 },
  { note: 'G#', position: 5 },
  { note: 'A#', position: 6 },
];

export function PianoKeyboard({ activeFrequency, className = '' }: PianoKeyboardProps) {
  const activeNoteName = activeFrequency ? getNoteName(activeFrequency) : null;

  return (
    <div
      className={`relative flex justify-center ${className}`}
      role="img"
      aria-label="Piano keyboard visualization"
    >
      <div className="relative flex">
        {/* White keys */}
        {WHITE_KEYS.map((note, index) => {
          const isActive = activeNoteName === note;
          const isTonic = note === 'C' || note === 'C2';
          const noteColor = PITCH_COLORS[note] || '#94a3b8';

          return (
            <div
              key={note}
              className={`
                relative w-8 h-24 md:w-10 md:h-28
                border border-gray-300 dark:border-gray-600
                rounded-b-md
                transition-all duration-150
                ${isActive
                  ? 'shadow-lg translate-y-0.5'
                  : 'shadow-md'
                }
                ${index === 0 ? 'rounded-bl-lg' : ''}
                ${index === WHITE_KEYS.length - 1 ? 'rounded-br-lg' : ''}
              `}
              style={{
                backgroundColor: isActive ? noteColor : isTonic ? '#dcfce7' : 'white',
                boxShadow: isActive ? `0 4px 12px ${noteColor}80` : undefined,
              }}
            >
              {/* Note label */}
              <div
                className={`
                  absolute bottom-2 left-1/2 -translate-x-1/2
                  text-xs font-bold
                  ${isActive ? 'text-white' : isTonic ? 'text-green-700' : 'text-gray-400'}
                `}
              >
                {note.replace('2', '')}
              </div>

              {/* Tonic indicator */}
              {isTonic && !isActive && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
          );
        })}

        {/* Black keys overlay */}
        {BLACK_KEYS.map(({ note, position }) => {
          // Black keys are not in our NOTES scale, so they won't be active
          return (
            <div
              key={note}
              className={`
                absolute top-0 w-5 h-14 md:w-6 md:h-16
                bg-gray-800 dark:bg-gray-900
                rounded-b-md shadow-md
                border border-gray-700
              `}
              style={{
                left: `calc(${position * (100 / WHITE_KEYS.length)}% + ${100 / WHITE_KEYS.length / 2}% - 10px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PianoKeyboard;
