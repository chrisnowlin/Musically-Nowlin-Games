/**
 * ConductorPanel - Central control panel for orchestrating all instruments
 */

// Musical tempo markings (slowest to fastest, max 140 BPM)
const TEMPO_LEVELS = [
  { bpm: 50, label: 'Largo' },
  { bpm: 70, label: 'Adagio' },
  { bpm: 90, label: 'Andante' },
  { bpm: 110, label: 'Moderato' },
  { bpm: 125, label: 'Allegro' },
  { bpm: 140, label: 'Vivace' },
];

// Get the closest tempo marking for a given BPM
const getTempoLabel = (bpm: number): string => {
  const closest = TEMPO_LEVELS.reduce((prev, curr) =>
    Math.abs(curr.bpm - bpm) < Math.abs(prev.bpm - bpm) ? curr : prev
  );
  return closest.label;
};

// Musical dynamics levels (pp to ff)
const DYNAMICS_LEVELS = [
  { value: 0.2, label: 'pp', name: 'pianissimo' },
  { value: 0.35, label: 'p', name: 'piano' },
  { value: 0.5, label: 'mp', name: 'mezzo-piano' },
  { value: 0.65, label: 'mf', name: 'mezzo-forte' },
  { value: 0.8, label: 'f', name: 'forte' },
  { value: 1.0, label: 'ff', name: 'fortissimo' },
];

// Get the closest dynamics level for a given value
const getDynamicsLabel = (value: number): string => {
  const closest = DYNAMICS_LEVELS.reduce((prev, curr) =>
    Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
  );
  return closest.label;
};

interface ConductorPanelProps {
  isPlaying: boolean;
  isLooping: boolean;
  tempo: number;
  dynamics: number;
  onPlay: () => void;
  onStop: () => void;
  onTempoChange: (tempo: number) => void;
  onDynamicsChange: (dynamics: number) => void;
  onLoopToggle: () => void;
}

export function ConductorPanel({
  isPlaying,
  isLooping,
  tempo,
  dynamics,
  onPlay,
  onStop,
  onTempoChange,
  onDynamicsChange,
  onLoopToggle,
}: ConductorPanelProps) {
  return (
    <div className="bg-black/60 backdrop-blur-sm border-t border-amber-400/30 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
        {/* Play/Stop Button */}
        <button
          onClick={isPlaying ? onStop : onPlay}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            text-3xl transition-all duration-200 border-2
            ${isPlaying
              ? 'bg-amber-900/80 border-amber-400 hover:bg-amber-800/80'
              : 'bg-amber-500 border-amber-300 hover:bg-amber-400'
            }
          `}
          aria-label={isPlaying ? 'Stop' : 'Play'}
        >
          {isPlaying ? '⏹' : '▶️'}
        </button>

        {/* Tempo Control with musical markings */}
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-amber-200 text-sm flex justify-between">
            <span>Tempo</span>
            <span className="font-bold italic">{getTempoLabel(tempo)}</span>
          </label>
          <div className="relative">
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={TEMPO_LEVELS.findIndex(t => Math.abs(t.bpm - tempo) < 10)}
              onChange={(e) => onTempoChange(TEMPO_LEVELS[Number(e.target.value)].bpm)}
              className="w-full accent-amber-400"
            />
            {/* Notch labels */}
            <div className="flex justify-between text-xs text-amber-300/70 mt-1 px-1">
              {TEMPO_LEVELS.map((level) => (
                <span key={level.label} className="italic">{level.bpm}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamics/Volume Control with musical notches */}
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-amber-200 text-sm flex justify-between">
            <span>Dynamics</span>
            <span className="font-bold italic">{getDynamicsLabel(dynamics)}</span>
          </label>
          <div className="relative">
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={DYNAMICS_LEVELS.findIndex(d => Math.abs(d.value - dynamics) < 0.1)}
              onChange={(e) => onDynamicsChange(DYNAMICS_LEVELS[Number(e.target.value)].value)}
              className="w-full accent-amber-400"
            />
            {/* Notch labels */}
            <div className="flex justify-between text-xs text-amber-300/70 mt-1 px-1">
              {DYNAMICS_LEVELS.map((level) => (
                <span key={level.label} className="italic">{level.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Loop Toggle */}
        <button
          onClick={onLoopToggle}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            transition-all duration-200 border-2
            ${isLooping
              ? 'bg-amber-500 border-amber-300 text-amber-950'
              : 'bg-amber-900/50 border-amber-600/50 text-amber-200 hover:bg-amber-800/50'
            }
          `}
          aria-label={isLooping ? 'Looping enabled' : 'Looping disabled'}
        >
          <span className="text-xl">🔁</span>
          <span className="text-sm font-medium">Loop</span>
        </button>
      </div>
    </div>
  );
}

