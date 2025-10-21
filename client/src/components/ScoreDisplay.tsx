import { Trophy, RotateCcw, Volume2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { playfulShapes, playfulTypography, playfulColors } from "@/theme/playful";

interface ScoreDisplayProps {
  score: number;
  totalQuestions: number;
  onReset: () => void;
  volume: number; // 0..100
  onVolumeChange: (v: number) => void;
}

export default function ScoreDisplay({ score, totalQuestions, onReset, volume, onVolumeChange }: ScoreDisplayProps) {
  return (
    <div className="flex items-center gap-4 justify-between w-full max-w-screen-2xl mx-auto px-4 lg:px-8">
      {/* Score counter */}
      <div
        data-testid="display-score"
        className={`flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-4 ${playfulShapes.rounded.container} ${playfulShapes.shadows.card} ${playfulShapes.borders.thick} border-yellow-400 dark:border-yellow-600`}
      >
        <div className="relative">
          <Trophy className="w-8 h-8 xl:w-10 xl:h-10 text-yellow-500 animate-pulse" />
          <Star className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 fill-yellow-400" />
        </div>
        <div className="flex flex-col">
          <span className={`${playfulTypography.headings.h2} text-foreground`}>
            {score}
          </span>
          <span className={`${playfulTypography.body.small} text-purple-800 dark:text-purple-200 font-semibold`}>
            ⭐ Correct Answers
          </span>
        </div>
        {totalQuestions > 0 && (
          <div className="ml-4 pl-4 border-l-4 border-purple-300 dark:border-purple-700">
            <span className={`${playfulTypography.body.large} text-purple-800 dark:text-purple-200 font-semibold`}>
              {Math.round((score / totalQuestions) * 100)}% 🎯
            </span>
          </div>
        )}
      </div>

      {/* Volume control */}
      <div className="hidden md:flex items-center gap-3 ml-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-3 rounded-full border-4 border-pink-300 dark:border-pink-700 shadow-lg">
        <Label htmlFor="volume" className="font-nunito text-sm text-purple-800 dark:text-purple-200 sr-only">Volume</Label>
        <Volume2 aria-hidden className="w-5 h-5 text-purple-600" />
        <Slider
          size="lg"
          aria-label="Volume"
          id="volume"
          className="w-[clamp(10rem,20vw,22rem)]"
          value={[volume]}
          max={100}
          step={1}
          onValueChange={(v) => onVolumeChange(v[0])}
        />
        <span className={`${playfulTypography.body.small} text-purple-800 dark:text-purple-200 font-semibold tabular-nums w-10 text-right`}>{volume}%</span>
      </div>

      {/* Reset button */}
      <Button
        onClick={onReset}
        size="lg"
        data-testid="button-reset"
        className={`gap-2 ${playfulShapes.rounded.button} ${playfulShapes.shadows.button} ${playfulColors.gradients.buttonPrimary} font-fredoka font-bold text-base md:text-lg text-white border-0`}
      >
        <RotateCcw className="w-5 h-5" />
        New Game
      </Button>

    {/* Mobile volume control */}
    <div className="md:hidden w-full max-w-screen-2xl mx-auto px-4 mt-3">
      <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-3 rounded-full border-4 border-pink-300 dark:border-pink-700 shadow-lg">
        <Volume2 aria-hidden className="w-5 h-5 text-purple-600" />
        <Slider
          size="lg"
          aria-label="Volume"
          className="w-full"
          value={[volume]}
          max={100}
          step={1}
          onValueChange={(v) => onVolumeChange(v[0])}
        />
        <span className={`${playfulTypography.body.small} text-purple-800 dark:text-purple-200 font-semibold tabular-nums w-10 text-right`}>{volume}%</span>
      </div>
    </div>

    </div>
  );

}