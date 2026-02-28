import React from 'react';
import type { ChestReward } from '@/lib/gameLogic/merchantItems';

interface Props {
  reward: ChestReward;
  onClose: () => void;
}

const ChestRewardModal: React.FC<Props> = ({ reward, onClose }) => {
  const emoji = reward.kind === 'potion' ? '🧪' : reward.item.emoji;
  const name = reward.kind === 'potion' ? 'Potion' : reward.item.name;
  const description =
    reward.kind === 'potion' ? 'Restores 1 HP' : reward.item.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-950/90 to-gray-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-center text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">
          Chest Opened!
        </h2>
        <p className="text-center text-amber-400/70 text-xs mb-5 italic">
          You found something inside...
        </p>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-700 bg-amber-950/50 mb-5">
          <span className="text-4xl shrink-0">{emoji}</span>
          <div>
            <div className="font-semibold text-white">{name}</div>
            <div className="text-sm text-gray-400">{description}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ChestRewardModal;
