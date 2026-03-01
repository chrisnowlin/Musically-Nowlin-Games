import React from 'react';
import type { BattleCharacter } from '@shared/types/cadence-quest';

interface BattleHUDProps {
  player: BattleCharacter;
  opponent: BattleCharacter;
  activeTurn: 'player' | 'opponent';
  streak: number;
}

const BattleHUD: React.FC<BattleHUDProps> = ({ player, opponent, activeTurn, streak }) => {
  const hpBar = (char: BattleCharacter, isPlayer: boolean) => {
    const pct = Math.max(0, (char.hp / char.maxHp) * 100);
    const sprite = isPlayer ? '/images/cadence-quest/hero.svg' : '/images/cadence-quest/enemy.svg';
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <img
            src={sprite}
            alt=""
            className="w-8 h-8 object-contain flex-shrink-0"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-xs font-medium text-gray-200">
            {char.name} {isPlayer ? '(You)' : ''}
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isPlayer ? 'bg-green-600' : 'bg-red-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 p-3 bg-gray-900/80 rounded-lg border border-gray-700">
      <div className="flex-1 min-w-0">
        {hpBar(player, true)}
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <span className={`text-sm font-bold ${activeTurn === 'player' ? 'text-green-400' : 'text-gray-400'}`}>
          Your turn
        </span>
        <span className={`text-sm font-bold ${activeTurn === 'opponent' ? 'text-red-400' : 'text-gray-400'}`}>
          Opponent
        </span>
        {streak >= 3 && (
          <span className="text-orange-400 font-bold animate-pulse">
            {streak}x streak!
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {hpBar(opponent, false)}
      </div>
    </div>
  );
};

export default BattleHUD;
