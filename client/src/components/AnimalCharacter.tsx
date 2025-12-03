import { memo } from "react";
import { AnimalCharacter as CharacterType } from "@/lib/schema";
import { Volume2, Check, X, Sparkles, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { playfulShapes, playfulTypography } from "@/theme/playful";
import monkeySvg from "@assets/monkey.svg";
import birdSvg from "@assets/bird.svg";
import lionSvg from "@assets/lion.svg";
import elephantSvg from "@assets/elephant.svg";
import giraffeSvg from "@assets/giraffe.svg";

interface AnimalCharacterProps {
  character: CharacterType;
  position: number; // 1-based position (1-5)
  isPlaying: boolean;
  isSelected: boolean;
  isCorrect: boolean | null;
  disabled: boolean;
  onClick: () => void;
}

/**
 * AnimalCharacter component - displays an interactive animal character
 * Memoized to prevent unnecessary re-renders when props haven't changed
 */
function AnimalCharacter({
  character,
  position,
  isPlaying,
  isSelected,
  isCorrect,
  disabled,
  onClick,
}: AnimalCharacterProps) {
  // Get sprite/image based on character ID - use SVGs for all characters
  const getCharacterImage = () => {
    const imageMap: Record<string, string> = {
      elephant: elephantSvg,
      giraffe: giraffeSvg,
      monkey: monkeySvg,
      bird: birdSvg,
      lion: lionSvg,
    };
    return imageMap[character.id] || monkeySvg;
  };

  // Character emoji for decoration
  const getCharacterEmoji = () => {
    const emojiMap: Record<string, string> = {
      elephant: "🐘",
      giraffe: "🦒",
      monkey: "🐵",
      bird: "🐦",
      lion: "🦁",
    };
    return emojiMap[character.id] || "🎵";
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`${character.name}${isPlaying ? " (playing)" : ""}${isSelected ? " (selected)" : ""}`}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 transform",
        "min-w-[120px] min-h-[140px] sm:min-w-[140px] sm:min-h-[160px]",
        playfulShapes.shadows.card,
        // Base state
        !disabled && "hover:scale-105 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        // Playing state
        isPlaying && "ring-4 ring-yellow-400 animate-pulse bg-yellow-50 dark:bg-yellow-900/30",
        // Selected state  
        isSelected && !isCorrect && isCorrect !== false && "ring-4 ring-blue-400 bg-blue-50 dark:bg-blue-900/30",
        // Correct/incorrect feedback
        isCorrect === true && "ring-4 ring-green-400 bg-green-50 dark:bg-green-900/30",
        isCorrect === false && "ring-4 ring-red-400 bg-red-50 dark:bg-red-900/30",
        // Default background
        !isPlaying && !isSelected && isCorrect === null && "bg-white dark:bg-gray-800 border-4 border-purple-300 dark:border-purple-600"
      )}
    >
      {/* Character image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2">
        <img
          src={getCharacterImage()}
          alt={character.name}
          className="w-full h-full object-contain"
        />
        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute -top-2 -right-2">
            <Volume2 className="w-6 h-6 text-yellow-500 animate-bounce" />
          </div>
        )}
        {/* Sparkle decoration when selected */}
        {isSelected && !isPlaying && (
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-blue-400 animate-spin" style={{ animationDuration: '2s' }} />
        )}
      </div>

      {/* Character name */}
      <span className={cn(
        playfulTypography.body.medium,
        "font-semibold text-center",
        isPlaying && "text-yellow-700 dark:text-yellow-300",
        isSelected && "text-blue-700 dark:text-blue-300",
        isCorrect === true && "text-green-700 dark:text-green-300",
        isCorrect === false && "text-red-700 dark:text-red-300",
        !isPlaying && !isSelected && isCorrect === null && "text-gray-700 dark:text-gray-300"
      )}>
        {getCharacterEmoji()} {character.name}
      </span>

      {/* Feedback icons */}
      {isCorrect === true && (
        <div className="absolute top-2 right-2">
          <Check className="w-6 h-6 text-green-500" />
        </div>
      )}
      {isCorrect === false && (
        <div className="absolute top-2 right-2">
          <X className="w-6 h-6 text-red-500" />
        </div>
      )}

      {/* Music note decoration */}
      <Music className={cn(
        "absolute bottom-1 left-1 w-4 h-4 opacity-30",
        isPlaying && "text-yellow-500 opacity-100 animate-bounce"
      )} />
    </button>
  );
}

/**
 * Export memoized version to prevent re-renders when props haven't changed
 */
export default memo(AnimalCharacter);
