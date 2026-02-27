import React from 'react';

interface MobileDPadProps {
  onMove: (dx: number, dy: number) => void;
  onPotion?: () => void;
  disabled?: boolean;
  hasPotions?: boolean;
}

const dirBtnClass =
  'w-14 h-14 flex items-center justify-center rounded-xl bg-gray-700/80 active:bg-purple-700 active:scale-95 border border-gray-600 text-white font-bold text-lg transition-all touch-manipulation select-none disabled:opacity-30 disabled:active:scale-100 disabled:active:bg-gray-700/80';

const MobileDPad: React.FC<MobileDPadProps> = ({ onMove, onPotion, disabled, hasPotions }) => {
  return (
    <div className="flex items-end justify-center gap-6">
      <div className="grid grid-cols-3 gap-1.5 w-fit" role="group" aria-label="Movement controls">
        <div />
        <button
          className={dirBtnClass}
          onPointerDown={() => !disabled && onMove(0, -1)}
          disabled={disabled}
          aria-label="Move up"
        >
          W
        </button>
        <div />

        <button
          className={dirBtnClass}
          onPointerDown={() => !disabled && onMove(-1, 0)}
          disabled={disabled}
          aria-label="Move left"
        >
          A
        </button>
        <div className="w-14 h-14" />
        <button
          className={dirBtnClass}
          onPointerDown={() => !disabled && onMove(1, 0)}
          disabled={disabled}
          aria-label="Move right"
        >
          D
        </button>

        <div />
        <button
          className={dirBtnClass}
          onPointerDown={() => !disabled && onMove(0, 1)}
          disabled={disabled}
          aria-label="Move down"
        >
          S
        </button>
        <div />
      </div>

      {onPotion && (
        <button
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-pink-900/70 active:bg-pink-700 active:scale-95 border border-pink-700 text-xl transition-all touch-manipulation select-none disabled:opacity-30 disabled:active:scale-100 disabled:active:bg-pink-900/70"
          onPointerDown={() => !disabled && hasPotions && onPotion()}
          disabled={disabled || !hasPotions}
          aria-label="Use potion"
          title="Use potion"
        >
          {'\uD83E\uDDEA'}
        </button>
      )}
    </div>
  );
};

export default MobileDPad;
