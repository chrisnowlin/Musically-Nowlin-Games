import React, { useState } from 'react';
import type { ChallengeType, Tier } from './logic/dungeonTypes';

interface Props {
  defaultType: ChallengeType;
  defaultTier: Tier;
  enemyName: string;
  onStart: (type: ChallengeType, tier: Tier) => void;
  onCancel: () => void;
}

const CHALLENGE_TYPES: { value: ChallengeType; label: string }[] = [
  { value: 'noteReading', label: 'Note Reading' },
  { value: 'rhythmTap', label: 'Rhythm Tap' },
  { value: 'interval', label: 'Interval' },
  { value: 'dynamics', label: 'Dynamics' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'symbols', label: 'Symbols' },
  { value: 'terms', label: 'Terms' },
  { value: 'timbre', label: 'Timbre' },
];

const TIERS: Tier[] = [1, 2, 3, 4, 5];

const DevChallengeConfigModal: React.FC<Props> = ({ defaultType, defaultTier, enemyName, onStart, onCancel }) => {
  const [selectedType, setSelectedType] = useState<ChallengeType>(defaultType);
  const [selectedTier, setSelectedTier] = useState<Tier>(defaultTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border-2 border-cyan-600 bg-gradient-to-b from-cyan-950/90 to-gray-900/95 p-5 shadow-2xl">
        <h2 className="text-center text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">
          Dev Challenge Config
        </h2>
        <p className="text-center text-cyan-400 text-xs mb-4 italic">
          Testing encounter with {enemyName}
        </p>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Challenge Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ChallengeType)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:border-cyan-500 focus:outline-none"
          >
            {CHALLENGE_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-xs text-gray-400 mb-1">Tier (Difficulty)</label>
          <div className="flex gap-2">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                  selectedTier === t
                    ? 'bg-cyan-700 text-white border-2 border-cyan-400'
                    : 'bg-gray-800 text-gray-400 border border-gray-600 hover:bg-gray-700'
                }`}
              >
                T{t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onStart(selectedType, selectedTier)}
            className="flex-1 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-sm font-bold transition-colors"
          >
            Start Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevChallengeConfigModal;
