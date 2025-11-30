import { memo } from "react";
import { AnimalCharacter as CharacterType } from "@/lib/schema";
import { Volume2, Check, X, Sparkles, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { playfulShapes, playfulTypography } from "@/theme/playful";
import elephantSprites from "@assets/Gemini_Generated_Image_t2nuj7t2nuj7t2nu_1759934375606.png";
import giraffeSprites from "@assets/Gemini_Generated_Image_k46rk9k46rk9k46r_1759934375607.png";
import monkeySvg from "@assets/monkey.svg";
import birdSvg from "@assets/bird.svg";
import lionSvg from "@assets/lion.svg";

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
  // Get sprite/image based on character ID
  const getCharacterImage = () => {
    const imageMap: Record<string, string> = {
      elephant: elephantSprites,
      giraffe: giraffeSprites,
      monkey: monkeySvg,
      bird: birdSvg,
      lion: lionSvg,
    };
    return imageMap[character.id] || elephantSprites;
  };

  // Check if the character uses an SVG (new placeholder images) or a sprite sheet (PNG)
  const isSvg = (): boolean => {
    const svgAnimals = ['monkey', 'bird', 'lion'];
    return svgAnimals.includes(character.id);
  };

  // Get the sprite position for the 3x3 grid (only for PNG sprite sheets)
  const getSpriteStyle = () => {
    // Only apply sprite positioning for PNG sprite sheets, not SVGs
    if (isSvg()) {
      return {};
    }
    
    // Sprite sheet is 3x3 grid
    // Row 1: violin, flute, trumpet
    // Row 2: harp, drum, trombone  
    // Row 3: clarinet, french horn, cymbals
    
    const instrumentMap: Record<string, { x: number; y: number }> = {
      "Trumpet": { x: -66.67, y: 0 }, // row 0, col 2
      "Violin": { x: 0, y: 0 }, // row 0, col 0
      "Flute": { x: -33.33, y: 0 }, // row 0, col 1
      "Clarinet": { x: 0, y: -66.67 }, // row 2, col 0
      "Oboe": { x: -33.33, y: -33.33 }, // row 1, col 1 (approximate)
    };
    
    const spritePos = instrumentMap[character.instrument] || { x: 0, y: 0 };
    return {
      transform: `translate(${spritePos.x}%, ${spritePos.y}%)`,
    };
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-character-${position}`}
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "w-fit min-w-[clamp(6rem,14vw,16rem)] aspect-square p-[clamp(0.25rem,0.5vw,0.75rem)]",
        "mx-auto",
        "bg-white dark:bg-gray-800",
        playfulShapes.rounded.card,
        playfulShapes.shadows.card,
        playfulShapes.borders.thick,
        "transition-all duration-300",
        "transform",
        !disabled && "cursor-pointer hover:scale-105 hover:-rotate-1 hover:shadow-2xl hover:border-purple-400",
        disabled && "cursor-not-allowed opacity-90",
        isPlaying && "ring-8 ring-purple-500/50 scale-105 z-10 shadow-[0_0_30px_rgba(168,85,247,0.5)] border-purple-500",
        isSelected && isCorrect === true && "bg-green-100 dark:bg-green-900/30 border-green-500 scale-105",
        isSelected && isCorrect === false && "bg-red-100 dark:bg-red-900/30 border-red-500",
        !isSelected && !isPlaying && "border-purple-300 dark:border-purple-700"
      )}
    >
      {/* Sound indicator when playing */}
      {isPlaying && (
        <>
          <div className="absolute top-4 right-4 z-10">
            <Volume2 className="text-purple-600 w-[clamp(2rem,2.8vw,2.75rem)] h-[clamp(2rem,2.8vw,2.75rem)] animate-pulse" />
          </div>
          {/* Floating musical notes */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
             <Music className="text-pink-500 w-8 h-8 animate-float-up absolute -left-4" style={{ animationDelay: '0ms' }} />
             <Music className="text-blue-500 w-6 h-6 animate-float-up absolute left-4 top-2" style={{ animationDelay: '200ms' }} />
             <Music className="text-yellow-500 w-10 h-10 animate-float-up absolute left-0 -top-4" style={{ animationDelay: '400ms' }} />
          </div>
        </>
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

      {/* Character Image */}
      <div className="mb-2 relative overflow-hidden w-[clamp(4rem,10vw,12rem)] h-[clamp(4rem,10vw,12rem)]">
        {isSvg() ? (
          // SVG images - display directly without sprite positioning
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={getCharacterImage()}
              alt={character.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          // PNG sprite sheets - use sprite positioning
          <img
            src={getCharacterImage()}
            alt={character.name}
            className="absolute w-[300%] h-[300%] max-w-none object-cover"
            style={{
              ...getSpriteStyle(),
              imageRendering: "auto"
            }}
          />
        )}
      </div>
    </button>
  );
}

/**
 * Export memoized version to prevent re-renders when props haven't changed
 * This is important because AnimalCharacter is rendered multiple times per game
 * and re-renders can be expensive with animations and images
 */
export default memo(AnimalCharacter);