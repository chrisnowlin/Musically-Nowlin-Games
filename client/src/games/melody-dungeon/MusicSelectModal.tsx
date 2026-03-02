import React from 'react';
import { MUSIC_TRACKS } from './logic/musicTracks';
import type { MusicTrack } from './logic/musicTracks';

interface Props {
  currentTrackId: string | null;
  onPlay: (track: MusicTrack) => void;
  onStop: () => void;
  onClose: () => void;
}

const MusicSelectModal: React.FC<Props> = ({ currentTrackId, onPlay, onStop, onClose }) => {
  const ambientTracks = MUSIC_TRACKS.filter((t) => t.category === 'ambient');
  const battleTracks = MUSIC_TRACKS.filter((t) => t.category === 'battle');

  const renderTrack = (track: MusicTrack) => {
    const isPlaying = currentTrackId === track.id;
    return (
      <button
        key={track.id}
        onClick={() => (isPlaying ? onStop() : onPlay(track))}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
          isPlaying
            ? 'bg-purple-700/50 border border-purple-500'
            : 'bg-gray-800/60 hover:bg-gray-700/60 border border-transparent'
        }`}
      >
        <span className="text-xl shrink-0">{track.emoji}</span>
        <span className="flex-1 text-sm font-medium truncate">{track.name}</span>
        <span className="text-xs shrink-0">
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-5 max-w-sm w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🎵 Jukebox</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ambient</h3>
          <div className="flex flex-col gap-1.5">
            {ambientTracks.map(renderTrack)}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Battle</h3>
          <div className="flex flex-col gap-1.5">
            {battleTracks.map(renderTrack)}
          </div>
        </div>

        <button
          onClick={onStop}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
        >
          🔇 Stop Music
        </button>
      </div>
    </div>
  );
};

export default MusicSelectModal;
