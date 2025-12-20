/**
 * PatternSelector - Simple dot-based pattern selection
 */

import type { Pattern } from '@/lib/aoc-v2/InstrumentPatterns';

interface PatternSelectorProps {
  patterns: Pattern[];
  selectedPattern: Pattern | null;
  onSelectPattern: (pattern: Pattern | null) => void;
  disabled?: boolean;
}

export function PatternSelector({
  patterns,
  selectedPattern,
  onSelectPattern,
  disabled = false,
}: PatternSelectorProps) {
  const handleClick = (pattern: Pattern) => {
    // Toggle: if already selected, deselect (null), otherwise select
    if (selectedPattern?.id === pattern.id) {
      onSelectPattern(null);
    } else {
      onSelectPattern(pattern);
    }
  };

  return (
    <div className="flex gap-2">
      {patterns.map((pattern) => (
        <button
          key={pattern.id}
          onClick={() => handleClick(pattern)}
          disabled={disabled}
          aria-label={pattern.name}
          className={`
            transition-all duration-150
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          `}
        >
          <img
            src={selectedPattern?.id === pattern.id ? '/images/button_selected.png' : '/images/button_idle.png'}
            alt=""
            className="w-8 h-8"
          />
        </button>
      ))}
    </div>
  );
}

