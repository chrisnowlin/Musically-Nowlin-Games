import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Circle, Music, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface Beat {
  type: "note" | "rest";
  frequency?: number;
}

interface MusicalSequence {
  beats: Beat[];
  restCount: number;
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentSequence: MusicalSequence | null;
  hasPlayed: boolean;
  volume: number;
  currentBeatIndex: number;
}

// Simple melody notes
const MELODY_NOTES = [262, 294, 330, 349, 392, 440, 494, 523]; // C D E F G A B C

export default function RestFinderGame() {
  const [, setLocation] = useLocation();
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentSequence: null,
    hasPlayed: false,
    volume: 50,
    currentBeatIndex: -1,
  });

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted && !gameState.currentSequence) {
      generateNewSequence();
    }
  }, [gameStarted]);

  const playNote = useCallback(async (frequency: number, duration: number) => {
    const masterVolume = gameState.volume / 100;
    audio.setVolume(masterVolume);

    try {
      await audio.playNoteWithDynamics(frequency, duration, 0.7);
    } catch (err) {
      console.error('Failed to play note:', err);
    }
  }, [gameState.volume, audio]);

  const playSequence = useCallback(async (sequence: MusicalSequence) => {
    const beatDuration = 500; // milliseconds per beat

    for (let i = 0; i < sequence.beats.length; i++) {
      const beat = sequence.beats[i];

      setGameState(prev => ({ ...prev, currentBeatIndex: i }));

      if (beat.type === "note" && beat.frequency) {
        await playNote(beat.frequency, beatDuration);
      } else {
        // Rest - just silence
        await new Promise(resolve => setGameTimeout(resolve, beatDuration));
      }
    }

    setGameState(prev => ({ ...prev, currentBeatIndex: -1 }));
  }, [playNote, setGameTimeout]);

  const generateNewSequence = useCallback(() => {
    // Create a sequence of 8 beats with 0-3 rests
    const totalBeats = 8;
    const restCount = Math.floor(Math.random() * 4); // 0-3 rests

    const beats: Beat[] = [];

    // Create array indicating which positions are rests
    const restPositions = new Set<number>();
    while (restPositions.size < restCount) {
      restPositions.add(Math.floor(Math.random() * totalBeats));
    }

    // Build the sequence
    for (let i = 0; i < totalBeats; i++) {
      if (restPositions.has(i)) {
        beats.push({ type: "rest" });
      } else {
        // Pick a random note from the melody
        const frequency = MELODY_NOTES[Math.floor(Math.random() * MELODY_NOTES.length)];
        beats.push({ type: "note", frequency });
      }
    }

    setGameState(prev => ({
      ...prev,
      currentSequence: { beats, restCount },
      hasPlayed: false,
      feedback: null,
      currentBeatIndex: -1,
    }));
  }, []);

  const handlePlaySequence = useCallback(async () => {
    if (!gameState.currentSequence || gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    await playSequence(gameState.currentSequence);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentSequence, gameState.isPlaying, gameState.feedback, playSequence]);

  const handleAnswer = useCallback((selectedCount: number) => {
    if (!gameState.currentSequence || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = selectedCount === gameState.currentSequence.restCount;

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1,
      feedback: { show: true, isCorrect },
    }));

    if (isCorrect) {
      audio.playSuccessTone();
    } else {
      audio.playErrorTone();
    }

    setGameTimeout(() => {
      generateNewSequence();
    }, 3000);
  }, [gameState.currentSequence, gameState.hasPlayed, gameState.feedback, generateNewSequence, audio, setGameTimeout]);

  const handleStartGame = async () => {
    if (!isReady) {
      await initialize();
    }
    setGameStarted(true);
  };

  // Show audio error if initialization failed
  if (error) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4`}>
        <button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        <AudioErrorFallback error={error} onRetry={initialize} />
      </div>
    );
  }

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="text-center space-y-8 z-10 max-w-2xl">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              Rest Finder
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Count the quiet moments in the music!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Play className="w-6 h-6 text-purple-500" />
                <span>Listen to a sequence of 8 beats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🤫</span>
                <span>Count how many rests (silent beats) you hear</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about rests and their importance in music!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Playing!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full">
        <ScoreDisplay score={gameState.score} total={gameState.totalQuestions} />

        <div className="mt-8 mb-8">
          <h2 className={`${playfulTypography.headings.h2} text-center text-gray-800 dark:text-gray-200`}>
            Rest Finder
          </h2>
        </div>

        {/* Volume Control */}
        <div className={`w-full max-w-md mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-4 ${playfulShapes.shadows.card}`}>
          <div className="flex items-center gap-4">
            <VolumeX size={20} className="text-gray-600 dark:text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="flex-1"
              disabled={gameState.isPlaying}
            />
            <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[45px]">
              {gameState.volume}%
            </span>
          </div>
        </div>

        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} w-full max-w-2xl space-y-6`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to the 8-beat sequence
            </p>
          </div>

          {/* Beat Visualization */}
          {gameState.currentSequence && (
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {gameState.currentSequence.beats.map((beat, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all ${
                    index === gameState.currentBeatIndex
                      ? 'bg-purple-500 border-purple-600 scale-110 shadow-lg'
                      : gameState.hasPlayed && !gameState.feedback
                      ? beat.type === 'note'
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {gameState.hasPlayed && !gameState.feedback ? (
                    beat.type === 'note' ? (
                      <Music className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <span className="text-2xl text-gray-400">🤫</span>
                    )
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlaySequence}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} ${
                gameState.isPlaying ? 'animate-pulse' : ''
              }`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : gameState.hasPlayed ? 'Play Again' : 'Play Sequence'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="space-y-4">
              <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                How many rests (silent beats) did you hear?
              </p>
              <div className="grid grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((count) => (
                  <Button
                    key={count}
                    onClick={() => handleAnswer(count)}
                    size="lg"
                    className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white px-6 py-8 text-3xl font-bold"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!gameState.hasPlayed && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click the button above to hear the sequence!
            </p>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && gameState.currentSequence && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! There were {gameState.currentSequence.restCount} rest{gameState.currentSequence.restCount !== 1 ? 's' : ''}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    There were {gameState.currentSequence.restCount} rest{gameState.currentSequence.restCount !== 1 ? 's' : ''}!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            What are Rests in Music?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                Rests = Musical Silence
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A <strong>rest</strong> is a symbol that tells musicians to be silent for a specific amount of time.
                Just like notes tell us when to play, rests tell us when <em>not</em> to play!
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                Why Rests Matter
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Silence is just as important as sound in music! Rests create space, rhythm, and breathing room.
                They help music feel less crowded and more expressive.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Fun Fact:</strong> In sheet music, different rest symbols represent different durations:
              whole rest (▬), half rest (▬ above line), quarter rest (𝄽), eighth rest (𝄾).
              Famous composer Claude Debussy said, "Music is the space between the notes" - highlighting
              how important silence is to great music!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
