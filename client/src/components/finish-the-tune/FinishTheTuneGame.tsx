import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { audioService } from '@/lib/audioService';
import { Button } from '@/components/ui/button';
import {
  Play,
  HelpCircle,
  Sparkles,
  Volume2,
  Music,
  ChevronLeft,
  Pause,
  GitCompare,
} from 'lucide-react';
import {
  playfulColors,
  playfulTypography,
  playfulShapes,
  playfulComponents,
  generateDecorativeOrbs,
} from '@/theme/playful';
import { useAudioService } from '@/hooks/useAudioService';
import { useGameCleanup } from '@/hooks/useGameCleanup';
import AudioErrorFallback from '@/components/AudioErrorFallback';

import { useFinishTheTuneGame } from '@/hooks/useFinishTheTuneGame';
import { useFinishTheTunePersistence } from '@/hooks/useFinishTheTunePersistence';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import { StartScreen } from './StartScreen';
import { MelodyVisualizer } from './MelodyVisualizer';
import { OptionsCard } from './OptionsCard';
import { StreakCounter } from './StreakCounter';
import { ConfettiOverlay } from './ConfettiOverlay';
import { ProgressTracker } from './ProgressTracker';
import { SettingsPanel } from './SettingsPanel';
import { TimerDisplay } from './TimerDisplay';
import { AchievementToast } from './AchievementBadge';
import { PianoKeyboard } from './PianoKeyboard';
import { DIFFICULTY_CONFIG, NOTES } from './finish-the-tune-Logic';
import type { NoteEvent } from './types';

export default function FinishTheTuneGame() {
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);

  const audioContext = useRef<AudioContext | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const melodyEndTimeRef = useRef<number | null>(null);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout, clearAllTimeouts } = useGameCleanup();

  // Game state management
  const { state, actions } = useFinishTheTuneGame();

  // Persistence
  useFinishTheTunePersistence(state, actions.loadSavedState);

  // Track previous achievements to detect new ones
  const prevAchievementsRef = useRef<string[]>([]);
  useEffect(() => {
    const prevAchievements = prevAchievementsRef.current;
    const newAchievements = state.achievements.filter(
      (a) => !prevAchievements.includes(a)
    );
    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
    }
    prevAchievementsRef.current = state.achievements;
  }, [state.achievements]);

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

  const handleStartGame = async () => {
    await initialize();
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
    setGameStarted(true);
    actions.generateNewQuestion();
  };

  const playMelody = useCallback(
    async (notes: NoteEvent[], sequenceId: string) => {
      actions.playMelody(sequenceId);

      for (let i = 0; i < notes.length; i++) {
        actions.updateActiveNote(i);

        // Apply playback speed
        const duration = notes[i].duration * (1 / state.playbackSpeed);
        await audio.playNoteWithDynamics(notes[i].freq, duration, state.volume / 100);
      }

      actions.stopPlaying();
      melodyEndTimeRef.current = Date.now();
    },
    [state.playbackSpeed, state.volume, audio, actions]
  );

  const handlePlayMelodyStart = useCallback(async () => {
    if (!state.currentQuestion || state.isPlaying) return;

    actions.setHasPlayedMelody();
    await playMelody(state.currentQuestion.melodyStart, 'start');

    // Handle loop melody
    if (state.loopMelody && !state.feedback) {
      loopTimeoutRef.current = setTimeout(() => {
        handlePlayMelodyStart();
      }, 1000);
    }
  }, [state.currentQuestion, state.isPlaying, state.loopMelody, state.feedback, playMelody, actions]);

  // Auto-play effect
  useEffect(() => {
    if (state.autoPlay && state.currentQuestion && !state.hasPlayedMelody && !state.isPlaying) {
      const timeout = setTimeout(() => {
        handlePlayMelodyStart();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [state.autoPlay, state.currentQuestion, state.hasPlayedMelody, state.isPlaying, handlePlayMelodyStart]);

  // Timer effect for timed mode
  useEffect(() => {
    if (!state.timedMode || !gameStarted || state.timeRemaining <= 0) return;

    const interval = setInterval(() => {
      actions.tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timedMode, gameStarted, state.timeRemaining, actions]);

  // End timed game when time runs out
  useEffect(() => {
    if (state.timedMode && state.timeRemaining <= 0) {
      actions.endTimedGame();
    }
  }, [state.timedMode, state.timeRemaining, actions]);

  const handlePlayEnding = useCallback(
    async (ending: NoteEvent[], index: number) => {
      if (state.isPlaying || !state.currentQuestion) return;

      // Cancel loop if playing
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
        loopTimeoutRef.current = null;
      }

      const fullSequence = [...state.currentQuestion.melodyStart, ...ending];
      await playMelody(fullSequence, `option-${index}`);
    },
    [state.isPlaying, state.currentQuestion, playMelody]
  );

  // Compare two endings back-to-back
  const handleCompareEndings = useCallback(async () => {
    if (state.isPlaying || !state.currentQuestion || state.compareSelections.length !== 2) return;

    // Cancel loop if playing
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }

    const [first, second] = state.compareSelections;
    const firstEnding = state.shuffledOptions[first];
    const secondEnding = state.shuffledOptions[second];

    // Play first ending with melody start
    const firstSequence = [...state.currentQuestion.melodyStart, ...firstEnding];
    await playMelody(firstSequence, `compare-${first}`);

    // 500ms pause between endings
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Play second ending with melody start
    const secondSequence = [...state.currentQuestion.melodyStart, ...secondEnding];
    await playMelody(secondSequence, `compare-${second}`);

    // Clear compare selections after playing
    actions.clearCompareSelections();
  }, [state.isPlaying, state.currentQuestion, state.compareSelections, state.shuffledOptions, playMelody, actions]);

  const handleSelectEnding = useCallback(
    (selectedEnding: NoteEvent[], index: number) => {
      if (!state.currentQuestion || !state.hasPlayedMelody || state.feedback) return;

      // Cancel loop
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
        loopTimeoutRef.current = null;
      }

      const isCorrect = actions.selectAnswer(selectedEnding, index);

      // Find correct answer index for highlighting
      const correctIdx = state.shuffledOptions.findIndex(
        (opt) =>
          opt.length === state.currentQuestion!.correctEnding.length &&
          opt.every(
            (note, i) =>
              note.freq === state.currentQuestion!.correctEnding[i].freq
          )
      );
      setCorrectAnswerIndex(correctIdx);

      if (isCorrect) {
        audioService.playSuccessTone();
        setShowConfetti(true);

        // Check for speed demon achievement
        if (melodyEndTimeRef.current && Date.now() - melodyEndTimeRef.current < 3000) {
          actions.unlockAchievement('speed_demon');
        }
      } else {
        audioService.playErrorTone();

        // Play correct ending after 1s delay
        setGameTimeout(async () => {
          if (state.currentQuestion) {
            const fullSequence = [
              ...state.currentQuestion.melodyStart,
              ...state.currentQuestion.correctEnding,
            ];
            await playMelody(fullSequence, `correct-reveal`);
          }
        }, 1000);
      }

      // Feedback duration: 4s for wrong (to show correct), 2.5s for correct
      const feedbackDuration = isCorrect ? 2500 : 4000;

      setGameTimeout(() => {
        actions.clearFeedback();
        setCorrectAnswerIndex(null);
        setShowConfetti(false);

        // Check if should retry from wrong queue
        const shouldRetry =
          state.wrongQuestionQueue.length > 0 && state.streak >= 2;
        actions.generateNewQuestion(shouldRetry);
      }, feedbackDuration);
    },
    [
      state.currentQuestion,
      state.hasPlayedMelody,
      state.feedback,
      state.shuffledOptions,
      state.wrongQuestionQueue,
      state.streak,
      actions,
      setGameTimeout,
      playMelody,
    ]
  );

  // Keyboard navigation
  useKeyboardShortcuts({
    optionCount: state.shuffledOptions.length,
    focusedOptionIndex: state.focusedOptionIndex,
    isPlaying: state.isPlaying,
    hasPlayedMelody: state.hasPlayedMelody,
    hasFeedback: !!state.feedback,
    onSelectOption: (index) => {
      if (state.shuffledOptions[index]) {
        handleSelectEnding(state.shuffledOptions[index], index);
      }
    },
    onPlayMelody: handlePlayMelodyStart,
    onFocusChange: actions.setFocusedOption,
    onExit: () => setLocation('/games'),
    enabled: gameStarted,
  });

  // Fullscreen handling
  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const decorativeOrbs = generateDecorativeOrbs();

  // Get current note frequency for piano
  const getCurrentNoteFrequency = (): number | null => {
    if (!state.isPlaying || state.activeNoteIndex < 0 || !state.currentQuestion) {
      return null;
    }

    let notes: NoteEvent[] = [];
    if (state.playingSequenceId === 'start') {
      notes = state.currentQuestion.melodyStart;
    } else if (state.playingSequenceId?.startsWith('option-')) {
      const optionIndex = parseInt(state.playingSequenceId.split('-')[1]);
      notes = [
        ...state.currentQuestion.melodyStart,
        ...state.shuffledOptions[optionIndex],
      ];
    } else if (state.playingSequenceId === 'correct-reveal') {
      notes = [
        ...state.currentQuestion.melodyStart,
        ...state.currentQuestion.correctEnding,
      ];
    }

    return notes[state.activeNoteIndex]?.freq ?? null;
  };

  // Start screen
  if (!gameStarted) {
    return (
      <StartScreen
        onStart={handleStartGame}
        difficulty={state.difficulty}
        onDifficultyChange={actions.setDifficulty}
        persistedStats={{
          highScore: state.highScore,
          bestStreak: state.bestStreak,
        }}
        timedMode={state.timedMode}
        onTimedModeToggle={actions.toggleTimedMode}
      />
    );
  }

  // Timed mode ended
  if (state.timedMode === false && state.timeRemaining === 0 && state.totalQuestions > 0) {
    return (
      <div
        className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4`}
      >
        <div
          className={`${playfulShapes.rounded.container} bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 ${playfulShapes.shadows.card} max-w-md w-full text-center space-y-6`}
        >
          <h2 className={`${playfulTypography.headings.h2} text-purple-600`}>
            Time's Up!
          </h2>
          <div className="space-y-4">
            <div className="text-5xl font-bold text-green-600">{state.score}</div>
            <div className="text-gray-600 dark:text-gray-400">
              points in 60 seconds
            </div>
            <div className="text-sm text-gray-500">
              Best Streak: {state.bestStreak} | Accuracy:{' '}
              {Math.round((state.score / state.totalQuestions) * 100)}%
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setLocation('/games')} variant="outline">
              Exit
            </Button>
            <Button
              onClick={() => {
                actions.resetGame();
                actions.toggleTimedMode();
                actions.generateNewQuestion();
              }}
              className={playfulComponents.button.primary}
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}
    >
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      {/* Confetti */}
      <ConfettiOverlay trigger={showConfetti} />

      {/* Achievement Toast */}
      {newAchievement && (
        <AchievementToast
          achievementId={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-6 relative z-10 flex-wrap gap-4">
        <button
          onClick={() => setLocation('/games')}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-bold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all min-h-[44px]"
          aria-label="Exit game"
        >
          <ChevronLeft size={20} />
          Exit
        </button>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* Timer (timed mode) */}
          {state.timedMode && <TimerDisplay timeRemaining={state.timeRemaining} />}

          {/* Streak Counter */}
          <StreakCounter streak={state.streak} bestStreak={state.bestStreak} />

          {/* Score Display */}
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm border border-purple-100">
            <div className="flex flex-col items-center px-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Score
              </span>
              <span className="text-xl font-bold text-purple-600">
                {state.score}/{state.totalQuestions}
              </span>
            </div>
          </div>

          {/* Progress Tracker */}
          <ProgressTracker completedMelodies={state.completedMelodies} />
        </div>

        <div className="flex items-center gap-3">
          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm min-h-[44px]">
            <Volume2 className="w-5 h-5 text-gray-600" />
            <input
              type="range"
              min="0"
              max="100"
              value={state.volume}
              onChange={(e) => actions.setVolume(parseInt(e.target.value))}
              className="w-24 accent-purple-500"
              disabled={state.isPlaying}
              aria-label="Volume"
            />
          </div>

          {/* Settings Panel */}
          <SettingsPanel
            playbackSpeed={state.playbackSpeed}
            onPlaybackSpeedChange={actions.setPlaybackSpeed}
            autoPlay={state.autoPlay}
            onAutoPlayToggle={actions.toggleAutoPlay}
            loopMelody={state.loopMelody}
            onLoopMelodyToggle={actions.toggleLoopMelody}
            showNoteNames={state.showNoteNames}
            onShowNoteNamesToggle={actions.toggleShowNoteNames}
            isFullscreen={isFullscreen}
            onFullscreenToggle={handleFullscreenToggle}
          />
        </div>
      </div>

      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        Press 1 through {DIFFICULTY_CONFIG[state.difficulty].optionCount} to select an
        option. Press Space to play the melody. Use arrow keys to navigate options.
        Press Enter to confirm selection. Press Escape to exit.
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-start z-10 max-w-4xl mx-auto w-full space-y-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* Question Card */}
          <div
            className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 md:p-8 ${playfulShapes.shadows.card} text-center relative overflow-hidden`}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500" />

            <h3
              className={`${playfulTypography.headings.h3} text-gray-800 dark:text-gray-200 mb-2`}
            >
              Can you finish this tune?
            </h3>

            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-6">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Hint: {state.currentQuestion?.hint}
            </p>

            {/* Melody Visualizer */}
            <div className="mb-4">
              <MelodyVisualizer
                notes={
                  state.playingSequenceId === 'start'
                    ? state.currentQuestion!.melodyStart
                    : state.playingSequenceId?.startsWith('option')
                      ? [
                          ...state.currentQuestion!.melodyStart,
                          ...state.shuffledOptions[
                            parseInt(state.playingSequenceId.split('-')[1])
                          ],
                        ]
                      : state.playingSequenceId === 'correct-reveal'
                        ? [
                            ...state.currentQuestion!.melodyStart,
                            ...state.currentQuestion!.correctEnding,
                          ]
                        : state.currentQuestion!.melodyStart
                }
                activeIndex={state.activeNoteIndex}
                isPlaying={state.isPlaying}
                showNoteNames={state.showNoteNames}
              />
            </div>

            {/* Piano Keyboard */}
            <div className="mb-6">
              <PianoKeyboard activeFrequency={getCurrentNoteFrequency()} />
            </div>

            {/* Play Button */}
            <Button
              onClick={handlePlayMelodyStart}
              disabled={state.isPlaying}
              size="lg"
              className={`
                ${playfulComponents.button.primary}
                w-full max-w-sm h-16 text-xl min-h-[64px]
                transform transition-all duration-200
                ${
                  state.isPlaying && state.playingSequenceId === 'start'
                    ? 'scale-95 opacity-90'
                    : 'hover:scale-105 shadow-lg'
                }
              `}
              aria-label={
                state.isPlaying
                  ? 'Playing melody'
                  : state.hasPlayedMelody
                    ? 'Listen again'
                    : 'Listen to melody'
              }
            >
              {state.isPlaying && state.playingSequenceId === 'start' ? (
                <div className="flex items-center gap-2">
                  <Pause className="w-6 h-6 animate-pulse" />
                  Playing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Music className="w-6 h-6" />
                  {state.hasPlayedMelody ? 'Listen Again' : 'Listen to Melody'}
                </div>
              )}
            </Button>

            {/* Melody Name Display (after answering) */}
            {state.feedback && state.currentQuestion && (
              <div
                className={`
                  mt-4 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-2
                  ${
                    state.feedback.isCorrect
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                  }
                `}
              >
                <span className="font-bold">
                  {state.feedback.isCorrect ? 'Correct!' : 'The melody was:'}
                </span>{' '}
                "{state.currentQuestion.description}"
              </div>
            )}
          </div>

          {/* Answer Options */}
          {state.hasPlayedMelody && state.currentQuestion && (
            <div
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4"
              role="listbox"
              aria-label="Answer options"
            >
              <div
                className="text-center text-gray-600 dark:text-gray-300 font-medium mb-2"
                aria-live="polite"
              >
                Which ending sounds best?
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.shuffledOptions.map((ending, index) => {
                  const endingKey = `option-${index}`;
                  const isPlayingThis =
                    state.isPlaying && state.playingSequenceId === endingKey;
                  const isSelected = state.selectedOptionIndex === index;
                  const isCorrectAnswer = correctAnswerIndex === index;
                  const showCorrectHighlight =
                    state.feedback && !state.feedback.isCorrect && isCorrectAnswer;
                  const isDisabled = state.isPlaying || !!state.feedback;
                  const isFocused = state.focusedOptionIndex === index;

                  return (
                    <OptionsCard
                      key={endingKey}
                      ending={ending}
                      index={index}
                      isPlayingThis={isPlayingThis || (state.isPlaying && state.playingSequenceId === `compare-${index}`)}
                      isSelected={isSelected}
                      isCorrectAnswer={isCorrectAnswer}
                      showCorrectHighlight={showCorrectHighlight ?? false}
                      isDisabled={isDisabled}
                      isFocused={isFocused && !state.feedback}
                      activeNoteIndex={state.activeNoteIndex}
                      melodyStartLength={state.currentQuestion!.melodyStart.length}
                      showNoteNames={state.showNoteNames}
                      compareMode={state.compareMode}
                      isCompareSelected={state.compareSelections.includes(index)}
                      onPlay={() => handlePlayEnding(ending, index)}
                      onSelect={() => handleSelectEnding(ending, index)}
                      onFocus={() => actions.setFocusedOption(index)}
                      onCompareSelect={() => actions.addCompareSelection(index)}
                    />
                  );
                })}
              </div>

              {/* Compare Controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  onClick={actions.toggleCompareMode}
                  variant={state.compareMode ? 'default' : 'outline'}
                  size="sm"
                  className={`min-h-[44px] ${state.compareMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  disabled={!!state.feedback}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  {state.compareMode ? 'Exit Compare' : 'Compare Mode'}
                </Button>

                {state.compareMode && state.compareSelections.length === 2 && (
                  <Button
                    onClick={handleCompareEndings}
                    disabled={state.isPlaying || !!state.feedback}
                    size="sm"
                    className="min-h-[44px] bg-blue-500 hover:bg-blue-600 animate-pulse"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Compare Now
                  </Button>
                )}

                {state.compareMode && state.compareSelections.length > 0 && state.compareSelections.length < 2 && (
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Select {2 - state.compareSelections.length} more to compare
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Educational Guide Toggle */}
        <div className="w-full max-w-2xl flex justify-center pt-4">
          <Button
            onClick={() => setShowGuide(!showGuide)}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 min-h-[44px]"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {showGuide ? 'Hide Guide' : 'How does this work?'}
          </Button>
        </div>

        {showGuide && (
          <div
            className={`${playfulShapes.rounded.container} bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 ${playfulShapes.shadows.card} max-w-2xl w-full animate-in slide-in-from-bottom-10`}
          >
            <h3
              className={`${playfulTypography.headings.h3} mb-6 text-center text-purple-600 dark:text-purple-400 flex items-center justify-center gap-2`}
            >
              <Music className="w-6 h-6" />
              The Secret of Musical Endings
            </h3>

            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0 text-2xl">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                    Stepwise Motion
                  </h4>
                  <p className="leading-relaxed">
                    Melodies often like to move in small steps. If a melody is going
                    down (D, C, B...), it usually wants to keep going or return to a
                    nearby safe note.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  Pro Tip:
                </h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-yellow-900 dark:text-yellow-100">
                  <li>Listen for which ending feels most "complete"</li>
                  <li>Notice if the ending returns to the starting note</li>
                  <li>Pay attention to the direction of the melody</li>
                  <li>Trust your musical intuition - what sounds right usually is!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {state.totalQuestions > 0 && !state.feedback && (
          <div
            className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card}`}
          >
            <h3 className={`${playfulTypography.headings.h3} mb-3 text-center`}>
              Your Progress
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {state.totalQuestions > 0
                    ? Math.round((state.score / state.totalQuestions) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {state.score}/{state.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
