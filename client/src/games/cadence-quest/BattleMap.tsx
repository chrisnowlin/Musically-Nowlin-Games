import React from 'react';
import type { BattleCharacter } from '@shared/types/cadence-quest';

interface BattleMapProps {
  player: BattleCharacter;
  opponent: BattleCharacter;
  activeTurn: 'player' | 'opponent';
  playerClass?: string;
  opponentClass?: string;
  isBoss?: boolean;
  regionId?: string;
  onAnimationEnd?: () => void;
}

const getCharacterSprite = (characterClass: string, isOpponent: boolean, isBoss: boolean, regionId?: string): string => {
  if (isBoss && isOpponent) {
    const bossSprites: Record<string, string> = {
      'rhythm-realm': '/images/cadence-quest/bosses/metronome-mage.svg',
      'harmony-hills': '/images/cadence-quest/bosses/maestro.svg',
      'timbre-tides': '/images/cadence-quest/bosses/siren.svg',
      'rhythm-ruins': '/images/cadence-quest/bosses/phoenix.svg',
      'melody-mountain': '/images/cadence-quest/bosses/kraken.svg',
    };
    return bossSprites[regionId || 'rhythm-realm'] || '/images/cadence-quest/bosses/siren.svg';
  }

  if (isOpponent) {
    return '/images/cadence-quest/enemy.svg';
  }

  const playerClassSprites: Record<string, string> = {
    'bard': '/images/cadence-quest/bard.svg',
    'rhythm': '/images/cadence-quest/drummer.svg',
    'harmony': '/images/cadence-quest/harmonist.svg',
    'timbre': '/images/cadence-quest/conductor.svg',
    'theory': '/images/cadence-quest/hero.svg',
  };

  return playerClassSprites[characterClass] || '/images/cadence-quest/hero.svg';
};

const BattleMap: React.FC<BattleMapProps> = ({
  player,
  opponent,
  activeTurn,
  playerClass = 'bard',
  opponentClass = 'bard',
  isBoss = false,
  regionId = 'rhythm-realm',
  onAnimationEnd,
}) => {
  const playerSprite = getCharacterSprite(playerClass, false, false);
  const opponentSprite = getCharacterSprite(opponentClass, true, isBoss, regionId);

  return (
    <div className="relative w-full h-[450px] overflow-hidden bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-xl border-2 border-purple-500/30 shadow-2xl" style={{ maxWidth: '900px' }}>
      {/* Floor grid with perspective */}
      <div className="absolute inset-0 perspective-1000">
        <div className="absolute bottom-0 left-0 right-0 h-32 origin-bottom transform rotate-x-60">
          {/* Grid lines */}
          <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-lg">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-0">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border border-cyan-400/10" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background ambient effects */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-purple-900/30 to-transparent" />
      <div className="absolute top-4 left-4 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-8 right-8 w-32 h-32 bg-purple-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Player character */}
      <div className={`
        absolute left-8 bottom-24 transition-all duration-300
        ${activeTurn === 'player' ? 'translate-y-0 scale-100' : 'translate-y-2 scale-95 opacity-80'}
      `}>
        <div className={`
          relative w-36 h-48 rounded-lg shadow-xl bg-transparent
          ${activeTurn === 'player' ? 'animate-charactershake' : ''}
        `}>
          {/* Character sprite */}
          <img
            src={playerSprite}
            alt={playerClass}
            className="w-full h-full object-contain drop-shadow-lg"
          />

          {/* HP Bar */}
          <div className="absolute -top-2 left-0 right-0 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                player.hp / player.maxHp > 0.5 ? 'bg-green-400' :
                player.hp / player.maxHp > 0.25 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              onAnimationEnd={() => activeTurn === 'player' && onAnimationEnd?.()}
            />
          </div>

          {/* Character name */}
          <div className="absolute -top-6 left-0 right-0 text-center">
            <span className="text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded">
              {player.name}
            </span>
          </div>

          {/* Active turn indicator */}
          {activeTurn === 'player' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-cyan-300 bg-black/70 px-2 py-0.5 rounded animate-bounce">
              YOUR TURN
            </div>
          )}
        </div>
      </div>

      {/* Opponent character */}
      <div className={`
        absolute right-8 bottom-24 transition-all duration-300
        ${activeTurn === 'opponent' ? 'translate-y-0 scale-100' : 'translate-y-2 scale-95 opacity-80'}
      `}>
        <div className={`
          relative w-36 h-48 rounded-lg shadow-xl bg-transparent
          ${activeTurn === 'opponent' ? 'animate-charactershake' : ''}
          ${isBoss ? 'border-4 border-amber-500/50' : ''}
        `}>
          {/* Character sprite */}
          <img
            src={opponentSprite}
            alt={isBoss ? 'Boss' : opponentClass}
            className={`w-full h-full object-contain drop-shadow-lg ${isBoss ? 'scale-110' : ''}`}
          />

          {/* HP Bar */}
          <div className="absolute -top-2 left-0 right-0 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                opponent.hp / opponent.maxHp > 0.5 ? 'bg-green-400' :
                opponent.hp / opponent.maxHp > 0.25 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${(opponent.hp / opponent.maxHp) * 100}%` }}
              onAnimationEnd={() => activeTurn === 'opponent' && onAnimationEnd?.()}
            />
          </div>

          {/* Character name */}
          <div className="absolute -top-6 left-0 right-0 text-center">
            <span className={`text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded ${
              isBoss ? 'text-amber-300' : ''
            }`}>
              {opponent.name}
            </span>
          </div>

          {/* Active turn indicator */}
          {activeTurn === 'opponent' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-red-300 bg-black/70 px-2 py-0.5 rounded animate-bounce">
              ENEMY TURN
            </div>
          )}

          {/* Boss indicator */}
          {isBoss && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <span className="text-sm font-bold text-amber-400 animate-pulse">⚠️ BOSS</span>
            </div>
          )}
        </div>
      </div>

      {/* Battle effects overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Particle effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* VS indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white/80 select-none">
        VS
      </div>
    </div>
  );
};

export default BattleMap;