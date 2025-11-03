import { AnimalCharacter as CharacterType } from "@/lib/schema";
import { Volume2, Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { playfulShapes, playfulTypography } from "@/theme/playful";
import elephantSprites from "@assets/Gemini_Generated_Image_t2nuj7t2nuj7t2nu_1759934375606.png";
import giraffeSprites from "@assets/Gemini_Generated_Image_k46rk9k46rk9k46r_1759934375607.png";

interface AnimalCharacterProps {
  character: CharacterType;
  position: 1 | 2;
  isPlaying: boolean;
  isSelected: boolean;
  isCorrect: boolean | null;
  disabled: boolean;
  onClick: () => void;
}

export default function AnimalCharacter({
  character,
  position,
  isPlaying,
  isSelected,
  isCorrect,
  disabled,
  onClick,
}: AnimalCharacterProps) {
  // Get the sprite position for the 3x3 grid
  const getSpriteStyle = () => {
    // Sprite sheet is 3x3 grid
    // Row 1: violin, flute, trumpet
    // Row 2: harp, drum, trombone  
    // Row 3: clarinet, french horn, cymbals
    
    if (character.instrument === "Trumpet") {
      // Trumpet is at row 0, col 2 (third in first row)
      return {
        transform: "translate(-66.67%, 0)", // Move 2/3 to the left
      };
    } else {
      // Violin is at row 0, col 0 (first in first row)
      return {
        transform: "translate(0, 0)",
      };
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-character-${position}`}
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "min-h-[clamp(6rem,14vw,16rem)] p-[clamp(0.25rem,0.5vw,0.75rem)]",
        "bg-white dark:bg-gray-800",
        playfulShapes.rounded.card,
        playfulShapes.shadows.card,
        playfulShapes.borders.thick,
        "transition-all duration-300",
        "transform",
        !disabled && "cursor-pointer hover:scale-105 hover:-rotate-1",
        disabled && "cursor-not-allowed opacity-90",
        isPlaying && "ring-4 ring-purple-500 animate-pulse",
        isSelected && isCorrect === true && "bg-green-100 dark:bg-green-900/30 border-green-500 scale-105",
        isSelected && isCorrect === false && "bg-red-100 dark:bg-red-900/30 border-red-500",
        !isSelected && !isPlaying && "border-purple-300 dark:border-purple-700 hover:border-purple-400"
      )}
    >
      {/* Sound indicator when playing */}
      {isPlaying && (
        <div className="absolute top-4 right-4 z-10">
          <Volume2 className="text-purple-600 w-[clamp(2rem,2.8vw,2.75rem)] h-[clamp(2rem,2.8vw,2.75rem)] animate-pulse" />
        </div>
      )}

      {/* Sparkle effect when hoverable and not disabled */}
      {!disabled && !isSelected && !isPlaying && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles className="text-yellow-400 w-6 h-6 animate-spin" />
        </div>
      )}

      {/* Feedback overlay */}
      {isSelected && isCorrect !== null && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center z-20",
          playfulShapes.rounded.card,
          "bg-opacity-90 transition-all duration-300",
          isCorrect ? "bg-green-500/30 animate-pulse" : "bg-red-500/30"
        )}>
          {isCorrect ? (
            <div className="flex flex-col items-center gap-2">
              <Check className="text-green-600 dark:text-green-400 w-[clamp(3.5rem,5vw,5.5rem)] h-[clamp(3.5rem,5vw,5.5rem)] animate-bounce" strokeWidth={4} />
              <span className="text-2xl">🎉</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <X className="text-red-600 dark:text-red-400 w-[clamp(3.5rem,5vw,5.5rem)] h-[clamp(3.5rem,5vw,5.5rem)]" strokeWidth={4} />
              <span className="text-2xl">💪</span>
            </div>
          )}
        </div>
      )}

      {/* Character name */}
      <h3 className={`${playfulTypography.headings.h3} mb-1 text-foreground`}>
        {character.name}
      </h3>

      {/* Character Image from Sprite Sheet */}
      <div className="mb-2 relative overflow-hidden w-[clamp(4rem,10vw,12rem)] h-[clamp(4rem,10vw,12rem)]">
        <img
          src={character.id === "elephant" ? elephantSprites : giraffeSprites}
          alt={character.name}
          className="absolute w-[300%] h-[300%] max-w-none object-cover"
          style={{
            ...getSpriteStyle(),
            imageRendering: "auto"
          }}
        />
      </div>
    </button>
  );
}