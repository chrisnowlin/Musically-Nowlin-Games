import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsOptions {
  optionCount: number;
  focusedOptionIndex: number;
  isPlaying: boolean;
  hasPlayedMelody: boolean;
  hasFeedback: boolean;
  onSelectOption: (index: number) => void;
  onPlayMelody: () => void;
  onFocusChange: (index: number) => void;
  onExit: () => void;
  enabled?: boolean;
}

/**
 * Hook for keyboard navigation in Finish the Tune game
 */
export function useKeyboardShortcuts({
  optionCount,
  focusedOptionIndex,
  isPlaying,
  hasPlayedMelody,
  hasFeedback,
  onSelectOption,
  onPlayMelody,
  onFocusChange,
  onExit,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't handle keys if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key;

      // Number keys 1-4 to select options directly
      if (['1', '2', '3', '4'].includes(key)) {
        const optionIndex = parseInt(key) - 1;
        if (optionIndex < optionCount && hasPlayedMelody && !hasFeedback && !isPlaying) {
          event.preventDefault();
          onSelectOption(optionIndex);
        }
        return;
      }

      switch (key) {
        case ' ':
        case 'Spacebar': // For older browsers
          // Play/replay melody
          event.preventDefault();
          if (!isPlaying) {
            onPlayMelody();
          }
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          // Navigate to previous option
          event.preventDefault();
          if (hasPlayedMelody && !hasFeedback) {
            const newIndex = focusedOptionIndex > 0 ? focusedOptionIndex - 1 : optionCount - 1;
            onFocusChange(newIndex);
          }
          break;

        case 'ArrowDown':
        case 'ArrowRight':
          // Navigate to next option
          event.preventDefault();
          if (hasPlayedMelody && !hasFeedback) {
            const newIndex = focusedOptionIndex < optionCount - 1 ? focusedOptionIndex + 1 : 0;
            onFocusChange(newIndex);
          }
          break;

        case 'Enter':
          // Confirm focused option
          event.preventDefault();
          if (hasPlayedMelody && !hasFeedback && !isPlaying) {
            onSelectOption(focusedOptionIndex);
          }
          break;

        case 'Escape':
          // Exit to menu
          event.preventDefault();
          onExit();
          break;

        default:
          break;
      }
    },
    [
      enabled,
      optionCount,
      focusedOptionIndex,
      isPlaying,
      hasPlayedMelody,
      hasFeedback,
      onSelectOption,
      onPlayMelody,
      onFocusChange,
      onExit,
    ]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return null;
}

export default useKeyboardShortcuts;
