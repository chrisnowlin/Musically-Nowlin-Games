import React from 'react';

type ExplorationItemId = 'torch' | 'map-scroll' | 'compass';

interface Props {
  torch: number;
  mapScroll: number;
  compass: number;
  onUse: (itemId: ExplorationItemId) => void;
  onClose: () => void;
}

const EXPLORATION_ITEMS: {
  id: ExplorationItemId;
  name: string;
  description: string;
  emoji: string;
  count: (props: Props) => number;
}[] = [
  { id: 'torch', name: 'Torch', description: '+2 visibility for this floor', emoji: '🔦', count: (p) => p.torch },
  { id: 'map-scroll', name: 'Map Scroll', description: 'Reveals entire minimap', emoji: '🗺️', count: (p) => p.mapScroll },
  { id: 'compass', name: 'Compass', description: 'Shows stairs on minimap', emoji: '🧭', count: (p) => p.compass },
];

const UseItemsModal: React.FC<Props> = (props) => {
  const { onUse, onClose } = props;
  const heldItems = EXPLORATION_ITEMS.filter((item) => item.count(props) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-950/90 to-gray-900/95 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-center text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">
          Item Bag
        </h2>
        <p className="text-center text-amber-400/70 text-xs mb-4 italic">
          Use an item now, or save it for later.
        </p>

        <div className="grid gap-2 mb-4">
          {heldItems.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">Your bag is empty</p>
          ) : (
            heldItems.map((item) => {
              const count = item.count(props);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-amber-700 bg-amber-950/50"
                >
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                  <span className="text-amber-300 text-sm font-medium shrink-0">&times;{count}</span>
                  <button
                    onClick={() => onUse(item.id)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors bg-amber-700 hover:bg-amber-600 text-white"
                  >
                    Use
                  </button>
                </div>
              );
            })
          )}
        </div>

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
