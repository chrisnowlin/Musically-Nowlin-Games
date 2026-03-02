import React from 'react';
import type { DevModeState } from './logic/dungeonTypes';

interface Props {
  devMode: DevModeState;
  onToggleInfiniteGold: () => void;
  onToggleInfiniteHealth: () => void;
  onReset: () => void;
  onBackToMenu: () => void;
}

const DevToolbar: React.FC<Props> = ({ devMode, onToggleInfiniteGold, onToggleInfiniteHealth, onReset, onBackToMenu }) => {
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
