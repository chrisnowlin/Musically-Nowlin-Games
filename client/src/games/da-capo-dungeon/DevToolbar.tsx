import React from 'react';
import type { DevModeState } from './logic/dungeonTypes';

interface Props {
  devMode: DevModeState;
  onToggleInfiniteGold: () => void;
  onToggleInfiniteHealth: () => void;
  onReset: () => void;
  onBackToMenu: () => void;
  onLootFloor?: () => void;
  onHealingFloor?: () => void;
  onFortuneFloor?: () => void;
  onChallengeFloor?: () => void;
  onRespawn?: () => void;
}

const DevToolbar: React.FC<Props> = ({ 
  devMode, 
  onToggleInfiniteGold, 
  onToggleInfiniteHealth, 
  onReset, 
  onBackToMenu, 
  onLootFloor, 
  onHealingFloor,
  onFortuneFloor,
  onChallengeFloor,
  onRespawn 
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 bg-cyan-950/60 backdrop-blur-sm rounded-lg border border-cyan-800 text-xs">
      <span className="text-cyan-400 font-bold uppercase tracking-wider mr-1">Dev</span>

      <button
        onClick={onToggleInfiniteGold}
        className={`px-2 py-1 rounded-md font-medium transition-colors ${
          devMode.infiniteGold
            ? 'bg-amber-700 text-amber-100 border border-amber-500'
            : 'bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700'
        }`}
      >
        {devMode.infiniteGold ? '\u221E Gold ON' : '\u221E Gold'}
      </button>

      <button
        onClick={onToggleInfiniteHealth}
        className={`px-2 py-1 rounded-md font-medium transition-colors ${
          devMode.infiniteHealth
            ? 'bg-red-700 text-red-100 border border-red-500'
            : 'bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700'
        }`}
      >
        {devMode.infiniteHealth ? '\u221E HP ON' : '\u221E HP'}
      </button>

      <div className="flex items-center gap-1 ml-1 pl-1 border-l border-cyan-700">
        <span className="text-cyan-500 text-[10px]">Floors:</span>
        
        {onLootFloor && (
          <button
            onClick={onLootFloor}
            className="px-2 py-1 rounded-md font-medium bg-yellow-900 text-yellow-300 border border-yellow-600 hover:bg-yellow-800 transition-colors"
            title="Loot Floor - 15-20 treasure piles"
          >
            {'\uD83D\uDCB0'}
          </button>
        )}
        
        {onHealingFloor && (
          <button
            onClick={onHealingFloor}
            className="px-2 py-1 rounded-md font-medium bg-emerald-900 text-emerald-300 border border-emerald-600 hover:bg-emerald-800 transition-colors"
            title="Healing Sanctuary - 3-5 pools, 2-3 shrines"
          >
            {'\uD83E\uDDEA'}
          </button>
        )}
        
        {onFortuneFloor && (
          <button
            onClick={onFortuneFloor}
            className="px-2 py-1 rounded-md font-medium bg-purple-900 text-purple-300 border border-purple-600 hover:bg-purple-800 transition-colors"
            title="Fortune Room - Mystery games"
          >
            {'\uD83D\uDD2E'}
          </button>
        )}
        
        {onChallengeFloor && (
          <button
            onClick={onChallengeFloor}
            className="px-2 py-1 rounded-md font-medium bg-red-900 text-red-300 border border-red-600 hover:bg-red-800 transition-colors"
            title="Challenge Arena - 6-8 enemies + chest"
          >
            {'\u2694\uFE0F'}
          </button>
        )}
      </div>

      {onRespawn && (
        <button
          onClick={onRespawn}
          className="px-2 py-1 rounded-md font-medium bg-purple-900 text-purple-300 border border-purple-600 hover:bg-purple-800 transition-colors"
        >
          Respawn
        </button>
      )}

      <button
        onClick={onReset}
        className="px-2 py-1 rounded-md font-medium bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700 transition-colors"
      >
        Reset All
      </button>

      <button
        onClick={onBackToMenu}
        className="px-2 py-1 rounded-md font-medium bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700 transition-colors"
      >
        Menu
      </button>
    </div>
  );
};

export default DevToolbar;
