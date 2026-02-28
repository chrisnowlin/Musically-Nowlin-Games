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
        <span className="flex items-center gap-0.5 text-yellow-300" title="Keys">
          <img src="/images/melody-dungeon-key.png" alt="Key" className="w-5 h-5 object-contain" /> {player.keys}
        </span>
        {player.potions > 0 && (
          <span className="flex items-center gap-0.5 text-pink-400" title="Potions">
            <img src="/images/melody-dungeon-potion.png" alt="Potion" className="w-5 h-5 object-contain" /> {player.potions}
          </span>
        )}
        {player.shieldCharm > 0 && (
          <span className="flex items-center gap-0.5 text-cyan-400" title="Shield Charm">
            {'\uD83D\uDEE1\uFE0F'} 1
          </span>
        )}
        {player.buffs.floor.torch && (
          <span className="text-xs" title="Torch active">{'\uD83D\uDD26'}</span>
        )}
        {player.buffs.floor.compass && (
          <span className="text-xs" title="Compass active">{'\uD83E\uDDED'}</span>
        )}
        {player.buffs.floor.mapRevealed && (
          <span className="text-xs" title="Map revealed">{'\uD83D\uDDFA\uFE0F'}</span>
        )}
        {player.buffs.persistent.streakSaver > 0 && (
          <span className="text-xs" title="Streak Saver">{'\uD83D\uDD25'}&times;{player.buffs.persistent.streakSaver}</span>
        )}
        {player.buffs.persistent.secondChance > 0 && (
          <span className="text-xs" title="Second Chance">{'\uD83D\uDD04'}&times;{player.buffs.persistent.secondChance}</span>
        )}
        {player.buffs.persistent.dragonBane > 0 && (
          <span className="text-xs" title="Dragon Bane">{'\u2694\uFE0F'}&times;{player.buffs.persistent.dragonBane}</span>
        )}
        {player.buffs.persistent.luckyCoin > 0 && (
          <span className="text-xs" title="Lucky Coin">{'\uD83E\uDE99'}&times;{player.buffs.persistent.luckyCoin}</span>
        )}
        {player.buffs.persistent.treasureMagnet > 0 && (
          <span className="text-xs" title="Treasure Magnet">{'\uD83E\uDDF2'}&times;{player.buffs.persistent.treasureMagnet}</span>
        )}
        {player.buffs.persistent.metronome > 0 && (
          <span className="text-xs" title="Metronome">{'\u23F1\uFE0F'}&times;{player.buffs.persistent.metronome}</span>
        )}
        {player.buffs.persistent.tuningFork > 0 && (
          <span className="text-xs" title="Tuning Fork">{'\uD83C\uDFB5'}&times;{player.buffs.persistent.tuningFork}</span>
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
