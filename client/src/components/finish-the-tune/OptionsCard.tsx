import { Button } from "@/components/ui/button";
import { Play, Volume2, Star, Check, X, GitCompare } from "lucide-react";
import { playfulShapes, playfulComponents } from "@/theme/playful";
import { MelodyVisualizer } from './MelodyVisualizer';
import type { NoteEvent } from './types';

interface OptionsCardProps {
  ending: NoteEvent[];
  index: number;
  isPlayingThis: boolean;
  isSelected: boolean;
  isCorrectAnswer: boolean;
  showCorrectHighlight: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  activeNoteIndex: number;
  melodyStartLength: number;
  showNoteNames: boolean;
  compareMode: boolean;
  isCompareSelected: boolean;
  onPlay: () => void;
  onSelect: () => void;
  onFocus: () => void;
  onCompareSelect: () => void;
}

export function OptionsCard({
  ending,
  index,
  isPlayingThis,
  isSelected,
  isCorrectAnswer,
  showCorrectHighlight,
  isDisabled,
  isFocused,
  activeNoteIndex,
  melodyStartLength,
  showNoteNames,
  compareMode,
  isCompareSelected,
  onPlay,
  onSelect,
  onFocus,
  onCompareSelect,
}: OptionsCardProps) {
  // Determine visual state
  const isCorrectSelection = isSelected && isCorrectAnswer;
  const isWrongSelection = isSelected && !isCorrectAnswer;
  const shouldShowAsCorrect = showCorrectHighlight && isCorrectAnswer;

  return (
    <div
      className={`
        relative overflow-hidden
        ${playfulShapes.rounded.container}
        border-4 transition-all duration-300
        ${isCorrectSelection
          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 scale-105 shadow-green-200 dark:shadow-green-800/50 shadow-xl'
          : isWrongSelection
            ? 'bg-red-100 dark:bg-red-900/30 border-red-500 scale-95 opacity-90'
            : shouldShowAsCorrect
              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 animate-pulse shadow-lg shadow-green-200/50'
              : isCompareSelected
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 shadow-lg shadow-blue-200/50'
                : isFocused
                  ? 'bg-white/90 dark:bg-gray-800/90 border-purple-500 shadow-lg ring-2 ring-purple-400 ring-offset-2'
                  : 'bg-white/80 dark:bg-gray-800/80 border-transparent hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg'
        }
        p-4 flex flex-col gap-4
      `}
      onMouseEnter={onFocus}
      role="option"
      aria-selected={isSelected}
      aria-label={`Option ${index + 1}${isCorrectSelection ? ', correct' : isWrongSelection ? ', incorrect' : ''}${isCompareSelected ? ', selected for comparison' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isDisabled) onSelect();
        }
      }}
    >
      {/* Result Icon Overlay */}
      {isCorrectSelection && (
        <div className="absolute top-2 right-2 animate-bounce z-20">
          <Star className="w-8 h-8 text-green-600 fill-green-600" />
        </div>
      )}
      {isWrongSelection && (
        <div className="absolute top-2 right-2 animate-pulse z-20">
          <X className="w-8 h-8 text-red-600" />
        </div>
      )}
      {shouldShowAsCorrect && !isSelected && (
        <div className="absolute top-2 right-2 animate-bounce z-20">
          <Check className="w-8 h-8 text-green-600" />
        </div>
      )}
      {isCompareSelected && (
        <div className="absolute top-2 left-2 z-20">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            <GitCompare className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <div className="text-center font-semibold text-gray-700 dark:text-gray-300 flex-1">
          {isCorrectSelection
            ? "Correct!"
            : isWrongSelection
              ? "Not quite..."
              : shouldShowAsCorrect
                ? "Correct Answer"
                : `Option ${index + 1}`}
        </div>
        {compareMode && !isDisabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompareSelect();
            }}
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${isCompareSelected
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }
            `}
            aria-label={isCompareSelected ? 'Remove from comparison' : 'Add to comparison'}
            aria-pressed={isCompareSelected}
          >
            {isCompareSelected && <Check className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Mini Visualizer */}
      <MelodyVisualizer
        notes={ending}
        activeIndex={isPlayingThis ? activeNoteIndex - melodyStartLength : -1}
        isPlaying={isPlayingThis}
        compact
        showTonic={false}
        showNoteNames={showNoteNames}
      />

      <div className="flex gap-2 justify-center mt-auto">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          disabled={isDisabled}
          variant="outline"
          size="sm"
          className={`
            flex-1 h-12 min-h-[44px] touch-manipulation
            ${isPlayingThis ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
          `}
          aria-label={`Preview option ${index + 1}`}
        >
          {isPlayingThis ? (
            <Volume2 className="w-4 h-4 animate-pulse mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Preview
        </Button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          disabled={isDisabled}
          className={`
            flex-1 h-12 min-h-[44px] touch-manipulation
            ${isCorrectSelection
              ? 'bg-green-600 hover:bg-green-700'
              : isWrongSelection
                ? 'bg-red-500 hover:bg-red-600'
                : playfulComponents.button.secondary
            }
          `}
          aria-label={`Select option ${index + 1} as your answer`}
        >
          {isCorrectSelection ? "Success!" : "Select"}
        </Button>
      </div>
    </div>
  );
}

export default OptionsCard;
