import React from 'react';
import type { PlayerState } from '@/lib/gameLogic/dungeonTypes';
import { MERCHANT_ITEMS } from '@/lib/gameLogic/merchantItems';
import type { MerchantItem } from '@/lib/gameLogic/merchantItems';

interface Props {
  player: PlayerState;
  floorNumber: number;
  onBuy: (item: MerchantItem) => void;
  onClose: () => void;
}

const MerchantModal: React.FC<Props> = ({ player, floorNumber, onBuy, onClose }) => {
  const handleBuy = (item: MerchantItem) => {
    const price = item.getPrice(floorNumber);
    if (player.score < price || !item.canBuy(player)) return;
    onBuy(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/90 to-gray-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-center text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">
          Wandering Merchant
        </h2>
        <p className="text-center text-emerald-400/70 text-xs mb-4 italic">
          &quot;What catches your eye?&quot;
        </p>

        <div className="flex justify-center mb-4">
          <span className="text-amber-400 font-bold text-lg">
            {'\u2B50'} {player.score} pts
          </span>
        </div>

        <div className="grid gap-2 mb-4">
          {MERCHANT_ITEMS.map((item) => {
            const price = item.getPrice(floorNumber);
            const canAfford = player.score >= price;
            const canBuy = canAfford && item.canBuy(player);

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  canBuy
                    ? 'border-emerald-700 bg-emerald-950/50'
                    : 'border-gray-700 bg-gray-900/50 opacity-60'
                }`}
              >
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={!canBuy}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    canBuy
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {price} pts
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium text-sm transition-colors"
        >
          Leave Shop
        </button>
      </div>
    </div>
  );
};

export default MerchantModal;
