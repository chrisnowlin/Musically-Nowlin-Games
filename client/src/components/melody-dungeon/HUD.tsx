import React from 'react';
import type { PlayerState, DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';

interface HUDProps {
  player: PlayerState;
  floorNumber: number;
  difficulty: DifficultyLevel;
  themeName?: string;
}

const HUD: React.FC<HUDProps> = ({ player, floorNumber, difficulty, themeName }) => {
  const hearts = Array.from({ length: player.maxHealth }, (_, i) =>
    i < player.health ? '\u2764\uFE0F' : '\uD83E\uDD0D'
  );

  const difficultyColors: Record<DifficultyLevel, string> = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400',
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 text-sm">
      <div className="flex items-center gap-1" title="Health">
        {hearts.map((h, i) => (
          <span key={i} className="text-base leading-none">{h}</span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-amber-400 font-bold" title="Score">
          {'\u2B50'} {player.score}
        </span>
        <span className="text-yellow-300" title="Keys">
          {'\uD83D\uDD11'} {player.keys}
        </span>
        {player.potions > 0 && (
          <span className="text-pink-400" title="Potions">
            {'\uD83E\uDDEA'} {player.potions}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {player.streak >= 3 && (
          <span className="text-orange-400 font-bold animate-pulse" title="Streak">
            {'\uD83D\uDD25'} {player.streak}
          </span>
        )}
        <span className="text-purple-300 font-medium" title="Floor">
          B{floorNumber}F
        </span>
        {themeName && (
          <span className="text-gray-400 text-xs italic hidden sm:inline" title="Dungeon Theme">
            {themeName}
          </span>
        )}
        <span className={`text-xs font-medium uppercase ${difficultyColors[difficulty]}`} title="Difficulty">
          {difficulty}
        </span>
      </div>
    </div>
  );
};

export default HUD;
