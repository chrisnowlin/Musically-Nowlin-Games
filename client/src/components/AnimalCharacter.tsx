import { memo } from "react";
import { AnimalCharacter as CharacterType } from "@/lib/schema";
import { Volume2, Check, X, Sparkles, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { playfulShapes } from "@/theme/playful";
import birdPng from "/images/bella-bird.jpeg";
import elephantPng from "/images/ellie-elephant.jpeg";
import giraffePng from "/images/gary-giraffe.jpeg";
import lionPng from "/images/leo-lion.jpeg";
import monkeyPng from "/images/milo-monkey.jpeg";

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
      elephant: elephantPng,
      giraffe: giraffePng,
      monkey: monkeyPng,
      bird: birdPng,
      lion: lionPng,
    };
    return imageMap[character.id] || monkeyPng;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`${character.name}${isPlaying ? " (playing)" : ""}${isSelected ? " (selected)" : ""}`}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300 transform",
        "w-[140px] h-[140px] sm:w-[160px] sm:h-[160px]",
        playfulShapes.shadows.card,
        // Base state
        !disabled && "hover:scale-105 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        // Playing state
        isPlaying && "ring-4 ring-yellow-400 animate-pulse",
        // Selected state
        isSelected && !isCorrect && isCorrect !== false && "ring-4 ring-blue-400",
        // Correct/incorrect feedback
        isCorrect === true && "ring-4 ring-green-400",
        isCorrect === false && "ring-4 ring-red-400",
        // Default background
        !isPlaying && !isSelected && isCorrect === null && "border-4 border-purple-300 dark:border-purple-600"
      )}
    >
      {/* Character image */}
      <div className="relative w-full h-full">
        <img
          src={getCharacterImage()}
          alt={character.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute top-1 right-1 bg-white/80 rounded-full p-1">
          <Volume2 className="w-5 h-5 text-yellow-500 animate-bounce" />
        </div>
      )}
      {/* Sparkle decoration when selected */}
      {isSelected && !isPlaying && (
        <div className="absolute top-1 right-1 bg-white/80 rounded-full p-1">
          <Sparkles className="w-5 h-5 text-blue-400 animate-spin" style={{ animationDuration: '2s' }} />
        </div>
      )}

      {/* Feedback icons */}
      {isCorrect === true && (
        <div className="absolute top-1 right-1 bg-white/80 rounded-full p-1">
          <Check className="w-5 h-5 text-green-500" />
        </div>
      )}
      {isCorrect === false && (
        <div className="absolute top-1 right-1 bg-white/80 rounded-full p-1">
          <X className="w-5 h-5 text-red-500" />
        </div>
      )}

      {/* Music note decoration */}
      <Music className={cn(
        "absolute bottom-2 left-2 w-5 h-5 text-white/60 drop-shadow-md",
        isPlaying && "text-yellow-300 animate-bounce"
      )} />
    </button>
  );
}

/**
 * Export memoized version to prevent re-renders when props haven't changed
 */
export default memo(AnimalCharacter);
