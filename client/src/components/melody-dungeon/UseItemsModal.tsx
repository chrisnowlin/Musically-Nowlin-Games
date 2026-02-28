import React from 'react';
import type { PlayerState } from '@/lib/gameLogic/dungeonTypes';

type ActiveItemId = 'torch' | 'map-scroll' | 'compass';
type PassiveItemId =
  | 'shield-charm'
  | 'streak-saver'
  | 'second-chance'
  | 'dragon-bane'
  | 'lucky-coin'
  | 'treasure-magnet'
  | 'metronome'
  | 'tuning-fork';

interface Props {
  player: PlayerState;
  onUse: (itemId: ActiveItemId | PassiveItemId) => void;
  onClose: () => void;
}

const ACTIVE_ITEMS: {
  id: ActiveItemId;
  name: string;
  description: string;
  emoji: string;
  count: (player: PlayerState) => number;
}[] = [
  { id: 'torch', name: 'Torch', description: '+2 visibility for this floor', emoji: '🔦', count: (p) => p.buffs.persistent.torch },
  { id: 'map-scroll', name: 'Map Scroll', description: 'Reveals entire minimap', emoji: '🗺️', count: (p) => p.buffs.persistent.mapScroll },
  { id: 'compass', name: 'Compass', description: 'Shows stairs on minimap', emoji: '🧭', count: (p) => p.buffs.persistent.compass },
];

const PASSIVE_ITEMS: {
  id: PassiveItemId;
  name: string;
  description: string;
  trigger: string;
  emoji: string;
  count: (player: PlayerState) => number;       // held in bag (persistent, not yet armed)
  armedCount: (player: PlayerState) => number;  // armed (will auto-trigger)
}[] = [
  { id: 'shield-charm', name: 'Shield Charm', description: 'Blocks next wrong-answer damage', trigger: 'On wrong answer', emoji: '🛡️', count: (p) => p.buffs.persistent.shieldCharm, armedCount: (p) => p.shieldCharm },
  { id: 'streak-saver', name: 'Streak Saver', description: 'Preserves streak on next miss', trigger: 'On missed answer', emoji: '🔥', count: (p) => p.buffs.persistent.streakSaver, armedCount: (p) => p.buffs.armed.streakSaver },
  { id: 'second-chance', name: 'Second Chance', description: 'Retry one failed challenge', trigger: 'On failed challenge', emoji: '🔄', count: (p) => p.buffs.persistent.secondChance, armedCount: (p) => p.buffs.armed.secondChance },
  { id: 'dragon-bane', name: 'Dragon Bane', description: 'Weakens next dragon by 1 HP', trigger: 'On dragon fight', emoji: '⚔️', count: (p) => p.buffs.persistent.dragonBane, armedCount: (p) => p.buffs.armed.dragonBane },
  { id: 'lucky-coin', name: 'Lucky Coin', description: 'Double score from next kill', trigger: 'On enemy defeat', emoji: '🪙', count: (p) => p.buffs.persistent.luckyCoin, armedCount: (p) => p.buffs.armed.luckyCoin },
  { id: 'treasure-magnet', name: 'Treasure Magnet', description: 'Double potion from treasure', trigger: 'On treasure room', emoji: '🧲', count: (p) => p.buffs.persistent.treasureMagnet, armedCount: (p) => p.buffs.armed.treasureMagnet },
  { id: 'metronome', name: 'Metronome', description: 'Half-speed next rhythm challenge', trigger: 'On rhythm challenge', emoji: '⏱️', count: (p) => p.buffs.persistent.metronome, armedCount: (p) => p.buffs.armed.metronome },
  { id: 'tuning-fork', name: 'Tuning Fork', description: 'Hints correct interval answer', trigger: 'On interval challenge', emoji: '🎵', count: (p) => p.buffs.persistent.tuningFork, armedCount: (p) => p.buffs.armed.tuningFork },
];

const UseItemsModal: React.FC<Props> = ({ player, onUse, onClose }) => {
  const heldActive = ACTIVE_ITEMS.filter((item) => item.count(player) > 0);
  const heldPassive = PASSIVE_ITEMS.filter((item) => item.count(player) > 0 || item.armedCount(player) > 0);
  const isEmpty = heldActive.length === 0 && heldPassive.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-950/90 to-gray-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-center text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">
          Item Bag
        </h2>
        <p className="text-center text-amber-400/70 text-xs mb-4 italic">
          Use an item now, or arm a passive for auto-trigger.
        </p>

        {isEmpty ? (
          <p className="text-center text-gray-500 text-sm py-4 mb-4">Your bag is empty</p>
        ) : (
          <div className="grid gap-2 mb-4 max-h-96 overflow-y-auto pr-1">
            {heldActive.length > 0 && (
              <>
                <div className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider px-1">
                  Active Items
                </div>
                {heldActive.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-amber-700 bg-amber-950/50"
                  >
                    <span className="text-2xl shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                    <span className="text-amber-300 text-sm font-medium shrink-0">&times;{item.count(player)}</span>
                    <button
                      onClick={() => onUse(item.id)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors bg-amber-700 hover:bg-amber-600 text-white"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </>
            )}

            {heldPassive.length > 0 && (
              <>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mt-1">
                  Passive Items
                </div>
                {heldPassive.map((item) => {
                  const held = item.count(player);
                  const armed = item.armedCount(player);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-700 bg-gray-800/50"
                    >
                      <span className="text-2xl shrink-0 opacity-80">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-200">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                        {armed > 0 && (
                          <div className="text-xs text-green-400 mt-0.5">⚡ {armed} armed</div>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm font-medium shrink-0">&times;{held}</span>
                      <button
                        onClick={() => onUse(item.id)}
                        disabled={held <= 0}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors bg-blue-800 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-default"
                        title={item.trigger}
                      >
                        Arm
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UseItemsModal;
