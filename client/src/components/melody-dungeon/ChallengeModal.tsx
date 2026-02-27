import React from 'react';
import type { ChallengeType, DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';
import { TileType } from '@/lib/gameLogic/dungeonTypes';
import NoteReadingChallenge from './challenges/NoteReadingChallenge';
import RhythmTapChallenge from './challenges/RhythmTapChallenge';
import IntervalChallenge from './challenges/IntervalChallenge';
import DynamicsChallenge from './challenges/DynamicsChallenge';

interface Props {
  challengeType: ChallengeType;
  tileType: TileType;
  difficulty: DifficultyLevel;
  onResult: (correct: boolean) => void;
}

const TILE_THEME: Record<string, { title: string; borderColor: string; bgColor: string }> = {
  [TileType.Enemy]: {
    title: 'Enemy Encounter!',
    borderColor: 'border-red-500',
    bgColor: 'from-red-950/90 to-gray-900/95',
  },
  [TileType.Boss]: {
    title: 'Boss Battle!',
    borderColor: 'border-purple-500',
    bgColor: 'from-purple-950/90 to-gray-900/95',
  },
  [TileType.Door]: {
    title: 'Locked Door!',
    borderColor: 'border-amber-500',
    bgColor: 'from-amber-950/90 to-gray-900/95',
  },
  [TileType.Treasure]: {
    title: 'Treasure Found!',
    borderColor: 'border-yellow-500',
    bgColor: 'from-yellow-950/90 to-gray-900/95',
  },
};

const DEFAULT_THEME = {
  title: 'Music Challenge!',
  borderColor: 'border-indigo-500',
  bgColor: 'from-indigo-950/90 to-gray-900/95',
};

const ChallengeModal: React.FC<Props> = ({ challengeType, tileType, difficulty, onResult }) => {
  const theme = TILE_THEME[tileType] || DEFAULT_THEME;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`
          w-full max-w-md rounded-2xl border-2 ${theme.borderColor}
          bg-gradient-to-b ${theme.bgColor} p-5 shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        `}
      >
        <h2 className="text-center text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          {theme.title}
        </h2>

        {challengeType === 'noteReading' && (
          <NoteReadingChallenge difficulty={difficulty} onResult={onResult} />
        )}
        {challengeType === 'rhythmTap' && (
          <RhythmTapChallenge difficulty={difficulty} onResult={onResult} />
        )}
        {challengeType === 'interval' && (
          <IntervalChallenge difficulty={difficulty} onResult={onResult} />
        )}
        {challengeType === 'dynamics' && (
          <DynamicsChallenge difficulty={difficulty} onResult={onResult} />
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
