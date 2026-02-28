import React from 'react';
import type { PlayerState, DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';

interface HUDProps {
  player: PlayerState;
  floorNumber: number;
  difficulty: DifficultyLevel;
  themeName?: string;
  onOpenBag?: () => void;
}

const HUD: React.FC<HUDProps> = ({ player, floorNumber, difficulty, themeName, onOpenBag }) => {
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
          <img src="/images/melody-dungeon/key.png" alt="Key" className="w-5 h-5 object-contain" /> {player.keys}
        </span>
        {player.potions > 0 && (
          <span className="flex items-center gap-0.5 text-pink-400" title="Potions">
            <img src="/images/melody-dungeon/potion.png" alt="Potion" className="w-5 h-5 object-contain" /> {player.potions}
          </span>
        )}
        {(() => {
          const p = player.buffs.persistent;
          const bagTotal =
            p.shieldCharm +
            p.torch + p.mapScroll + p.compass +
            p.streakSaver + p.secondChance + p.dragonBane +
            p.luckyCoin + p.treasureMagnet + p.metronome + p.tuningFork;
          return bagTotal > 0 ? (
            <button
              onClick={onOpenBag}
              className="flex items-center gap-1 text-amber-200 hover:text-white bg-amber-900/60 hover:bg-amber-800 border border-amber-600/60 hover:border-amber-500 px-2 py-1 rounded-lg transition-colors"
              title="Open item bag (U)"
            >
              <span className="text-base leading-none">{'\uD83C\uDF92'}</span>
              <span className="font-semibold text-sm">{bagTotal}</span>
            </button>
          ) : null;
        })()}
        {player.buffs.floor.torch && (
          <span className="text-xs text-yellow-300" title="Torch active">{'\uD83D\uDD26'}{'\u2713'}</span>
        )}
        {player.buffs.floor.compass && (
          <span className="text-xs text-yellow-300" title="Compass active">{'\uD83E\uDDED'}{'\u2713'}</span>
        )}
        {player.buffs.floor.mapRevealed && (
          <span className="text-xs text-yellow-300" title="Map revealed">{'\uD83D\uDDFA\uFE0F'}{'\u2713'}</span>
        )}
        {player.shieldCharm > 0 && (
          <span className="text-xs text-blue-300" title="Shield Charm armed">{'\uD83D\uDEE1\uFE0F'}&times;{player.shieldCharm}</span>
        )}
        {player.buffs.armed.streakSaver > 0 && (
          <span className="text-xs text-blue-300" title="Streak Saver armed">{'\uD83D\uDD25'}&times;{player.buffs.armed.streakSaver}</span>
        )}
        {player.buffs.armed.secondChance > 0 && (
          <span className="text-xs text-blue-300" title="Second Chance armed">{'\uD83D\uDD04'}&times;{player.buffs.armed.secondChance}</span>
        )}
        {player.buffs.armed.dragonBane > 0 && (
          <span className="text-xs text-blue-300" title="Dragon Bane armed">{'\u2694\uFE0F'}&times;{player.buffs.armed.dragonBane}</span>
        )}
        {player.buffs.armed.luckyCoin > 0 && (
          <span className="text-xs text-blue-300" title="Lucky Coin armed">{'\uD83E\uDE99'}&times;{player.buffs.armed.luckyCoin}</span>
        )}
        {player.buffs.armed.treasureMagnet > 0 && (
          <span className="text-xs text-blue-300" title="Treasure Magnet armed">{'\uD83E\uDDF2'}&times;{player.buffs.armed.treasureMagnet}</span>
        )}
        {player.buffs.armed.metronome > 0 && (
          <span className="text-xs text-blue-300" title="Metronome armed">{'\u23F1\uFE0F'}&times;{player.buffs.armed.metronome}</span>
        )}
        {player.buffs.armed.tuningFork > 0 && (
          <span className="text-xs text-blue-300" title="Tuning Fork armed">{'\uD83C\uDFB5'}&times;{player.buffs.armed.tuningFork}</span>
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
