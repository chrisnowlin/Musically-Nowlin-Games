import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Play, HelpCircle, ChevronLeft, Trophy, Zap, Star } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import type { Difficulty, PersistedState } from './types';
import { DIFFICULTY_CONFIG } from './finish-the-tune-Logic';

interface StartScreenProps {
  onStart: () => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  persistedStats?: Partial<PersistedState>;
  timedMode: boolean;
  onTimedModeToggle: () => void;
}

export function StartScreen({
  onStart,
  difficulty,
  onDifficultyChange,
  persistedStats,
  timedMode,
  onTimedModeToggle,
}: StartScreenProps) {
  const [, setLocation] = useLocation();
  const decorativeOrbs = generateDecorativeOrbs();

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
      <button
        onClick={() => setLocation("/games")}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        aria-label="Return to main menu"
      >
        <ChevronLeft size={24} />
        Main Menu
      </button>

      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="text-center space-y-8 z-10 max-w-2xl animate-in fade-in zoom-in duration-500">
        <div className="space-y-4">
          <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title} drop-shadow-lg`}>
            Finish the Tune
          </h1>
          <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
            Choose the correct ending for the melody!
          </p>
        </div>

        {/* High Score Display */}
        {persistedStats && (persistedStats.highScore || persistedStats.bestStreak) ? (
          <div className="flex justify-center gap-6">
            {persistedStats.highScore !== undefined && persistedStats.highScore > 0 && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-800 dark:text-yellow-200">
                  Best: {persistedStats.highScore}
                </span>
              </div>
            )}
            {persistedStats.bestStreak !== undefined && persistedStats.bestStreak > 0 && (
              <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-800 dark:text-orange-200">
                  Best Streak: {persistedStats.bestStreak}
                </span>
              </div>
            )}
          </div>
        ) : null}

        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
          <div className="flex items-center gap-3 text-lg">
            <HelpCircle className="w-6 h-6 text-green-600" />
            <span className={playfulTypography.body.medium}>How to Play:</span>
          </div>
          <ul className="text-left space-y-3 text-base text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
              <span className="text-2xl" aria-hidden="true">1.</span>
              <span className="pt-1">Listen to the incomplete melody</span>
            </li>
            <li className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg">
              <span className="text-2xl" aria-hidden="true">2.</span>
              <span className="pt-1">Preview each possible ending</span>
            </li>
            <li className="flex items-start gap-3 bg-pink-50 dark:bg-pink-900/30 p-2 rounded-lg">
              <span className="text-2xl" aria-hidden="true">3.</span>
              <span className="pt-1">Choose the ending that sounds most complete</span>
            </li>
            <li className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-lg">
              <span className="text-2xl" aria-hidden="true">4.</span>
              <span className="pt-1">Score points for recognizing musical resolution!</span>
            </li>
          </ul>

          {/* Difficulty Selection */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Select Difficulty:
            </p>
            <div className="flex justify-center gap-3">
              {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onDifficultyChange(level)}
                  className={`
                    px-4 py-2 rounded-full font-semibold text-sm transition-all
                    ${difficulty === level
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                    }
                  `}
                  aria-pressed={difficulty === level}
                >
                  {DIFFICULTY_CONFIG[level].label}
                  <span className="ml-1 text-xs opacity-75">
                    ({DIFFICULTY_CONFIG[level].optionCount})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Timed Mode Toggle */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onTimedModeToggle}
              className={`
                w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                ${timedMode
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                }
              `}
              aria-pressed={timedMode}
            >
              <Star className={`w-5 h-5 ${timedMode ? 'animate-pulse' : ''}`} />
              {timedMode ? 'Timed Challenge: ON (60s)' : 'Enable Timed Challenge Mode'}
            </button>
          </div>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} px-12 py-8 text-2xl shadow-xl min-h-[64px]`}
        >
          <Play className="w-10 h-10 mr-3 fill-current" />
          Start Playing!
        </Button>

        {/* Keyboard shortcuts hint */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Use keyboard: 1-4 to select options, Space to play melody
        </p>
      </div>
    </div>
  );
}

export default StartScreen;
