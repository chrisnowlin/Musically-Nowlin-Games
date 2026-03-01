import React, { useState, useEffect } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useWebSocket } from './logic/useWebSocket';
import type { Character, MusicChallenge } from '@shared/types/cadence-quest';

function isServerCharacter(id: string): boolean {
  return !isNaN(parseInt(id, 10));
}

interface MatchmakingScreenProps {
  character: Character | null;
  onMatched: (
    battleRoomId: string,
    opponent: { id: string; name: string; class: Character['class']; maxHp: number },
    initialChallenge?: MusicChallenge,
    challengeShownAt?: number
  ) => void;
  onBack: () => void;
}

const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ character, onMatched, onBack }) => {
  const { connected, emit, on } = useWebSocket();
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canQueue = connected && character && isServerCharacter(character.id);

  useEffect(() => {
    const unsub = on('matchmaking:matched', (payload: unknown) => {
      const p = payload as {
        battleRoomId: string;
        opponent: { id: string; name: string; class: Character['class']; maxHp: number };
        challenge?: MusicChallenge;
        shownAt?: number;
      };
      setSearching(false);
      onMatched(p.battleRoomId, p.opponent, p.challenge, p.shownAt);
    });
    return unsub;
  }, [on, onMatched]);

  useEffect(() => {
    const unsub = on('matchmaking:error', (payload: unknown) => {
      const p = payload as { message?: string };
      setSearching(false);
      setError(p.message || 'Matchmaking failed');
    });
    return unsub;
  }, [on]);

  const handleQueue = () => {
    if (!canQueue) return;
    setError(null);
    setSearching(true);
    emit('matchmaking:join', { characterId: parseInt(character!.id, 10) });
  };

  const handleLeave = () => {
    setSearching(false);
    setError(null);
    emit('matchmaking:leave', {});
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg text-purple-800 hover:bg-purple-200/60 hover:text-purple-900">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-purple-900 drop-shadow-sm">PvP Arena</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-purple-800">
            {connected ? 'Connected to server' : 'Server offline'}
          </span>
        </div>
        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}
        <button
          onClick={searching ? handleLeave : handleQueue}
          disabled={!canQueue}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2"
        >
          {searching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cancel Search
            </>
          ) : (
            'Find Match'
          )}
        </button>
      </div>
      <div className="p-4 rounded-xl bg-gray-800/80 border border-purple-500/30 text-center">
        <p className="text-sm text-gray-200">
          {!character
            ? 'Select a character first.'
            : !isServerCharacter(character.id)
              ? 'Create a character with a registered account to play PvP.'
              : 'Real-time PvP requires the game server (port 3001).'}
        </p>
      </div>
    </div>
  );
};

export default MatchmakingScreen;
