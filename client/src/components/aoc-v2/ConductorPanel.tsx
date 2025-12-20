/**
 * ConductorPanel - Central control panel for orchestrating all instruments
 */

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
            text-3xl transition-all duration-200
            ${isPlaying 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
            }
          `}
          aria-label={isPlaying ? 'Stop' : 'Play'}
        >
          {isPlaying ? '⏹' : '▶️'}
        </button>

        {/* Tempo Control */}
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-amber-200 text-sm flex justify-between">
            <span>Tempo</span>
            <span>{tempo} BPM</span>
          </label>
          <input
            type="range"
            min={60}
            max={180}
            value={tempo}
            onChange={(e) => onTempoChange(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>

        {/* Dynamics/Volume Control */}
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-amber-200 text-sm flex justify-between">
            <span>Dynamics</span>
            <span>{Math.round(dynamics * 100)}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(dynamics * 100)}
            onChange={(e) => onDynamicsChange(Number(e.target.value) / 100)}
            className="w-full accent-amber-400"
          />
        </div>

        {/* Loop Toggle */}
        <button
          onClick={onLoopToggle}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            transition-all duration-200
            ${isLooping 
              ? 'bg-amber-500 text-black' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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

