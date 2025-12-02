import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, Headphones, ArrowLeft, ArrowRight, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  volume: number;
  currentQuestion: Question | null;
  hasPlayed: boolean;
}

interface Question {
  side: 'left' | 'right' | 'center';
  frequency: number;
  description: string;
}

const SOUNDS = [
  { frequency: 440, name: "Bell", emoji: "🔔" },
  { frequency: 523, name: "Chime", emoji: "🎐" },
  { frequency: 659, name: "Whistle", emoji: "🎵" },
  { frequency: 349, name: "Drum", emoji: "🥁" },
  { frequency: 587, name: "Flute", emoji: "🎶" },
];

export default function EchoLocationChallengeGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    volume: 70,
    currentQuestion: null,
    hasPlayed: false,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const audioContext = useRef<AudioContext | null>(null);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

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
    generateNewQuestion();
  };

  const playSpatialSound = useCallback(async (frequency: number, side: 'left' | 'right' | 'center') => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    const panner = audioContext.current.createStereoPanner();

    oscillator.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Set stereo panning: -1 = left, 0 = center, 1 = right
    const panValue = side === 'left' ? -1 : side === 'right' ? 1 : 0;
    panner.pan.value = panValue;

    const masterVolume = gameState.volume / 100;
    const volume = 0.3 * masterVolume;
    const startTime = audioContext.current.currentTime;
    const duration = 0.8;

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    await new Promise(resolve => setTimeout(resolve, duration * 1000));
  }, [gameState.volume]);

  const generateNewQuestion = useCallback(() => {
    const sides: ('left' | 'right' | 'center')[] = ['left', 'right', 'center'];
    const randomSide = sides[Math.floor(Math.random() * sides.length)];
    const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];

    const sideDescriptions = {
      left: "from the left side",
      right: "from the right side",
      center: "from the center",
    };

    setGameState(prev => ({
      ...prev,
      currentQuestion: {
        side: randomSide,
        frequency: randomSound.frequency,
        description: `${randomSound.emoji} ${randomSound.name} ${sideDescriptions[randomSide]}`,
      },
      feedback: null,
      hasPlayed: false,
    }));
  }, []);

  const handlePlaySound = useCallback(async () => {
    if (!gameState.currentQuestion || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    await playSpatialSound(gameState.currentQuestion.frequency, gameState.currentQuestion.side);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentQuestion, gameState.isPlaying, playSpatialSound]);

  const handleAnswer = useCallback((selectedSide: 'left' | 'right' | 'center') => {
    if (!gameState.currentQuestion || !gameState.hasPlayed) return;

    const isCorrect = selectedSide === gameState.currentQuestion.side;

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1,
      feedback: { show: true, isCorrect },
    }));

    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    setGameTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
      generateNewQuestion();
    }, 2000);
  }, [gameState.currentQuestion, gameState.hasPlayed, generateNewQuestion, setGameTimeout]);

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/games")}
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
              👂 Echo Location Challenge
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Which side did the sound come from?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎧</span>
                <span>Put on headphones for the best experience!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🔊</span>
                <span>Click "Play Sound" to hear a sound</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">👈👉</span>
                <span>Identify which direction the sound came from</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⭐</span>
                <span>Score points for correct answers!</span>
              </li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Headphones strongly recommended for this game!
              </p>
            </div>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Listening!
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

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full space-y-8">
        <ScoreDisplay score={gameState.score} total={gameState.totalQuestions} />

        <div className="text-center space-y-4 w-full">
          <h2 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-gray-200`}>
            Echo Location Challenge
          </h2>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-4 px-4">
            <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={gameState.volume}
              onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              className="flex-1 max-w-xs"
              disabled={gameState.isPlaying}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">
              {gameState.volume}%
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <Headphones className="w-5 h-5" />
            <span className="text-sm font-medium">Headphones recommended!</span>
          </div>
        </div>

        {/* Play Sound Button */}
        <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 ${playfulShapes.shadows.card} text-center space-y-6`}>
          <div className="space-y-4">
            <h3 className={`${playfulTypography.headings.h3} text-blue-600 dark:text-blue-400`}>
              Listen Carefully...
            </h3>
            <Button
              onClick={handlePlaySound}
              disabled={gameState.isPlaying}
              size="lg"
              className={`${playfulComponents.button.primary} w-64 h-20 text-xl transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-8 h-8 mr-3" />
              {gameState.hasPlayed ? "Play Again" : "Play Sound"}
            </Button>
            {!gameState.hasPlayed && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                Click to hear the sound, then choose which direction it came from below.
              </p>
            )}
          </div>
        </div>

        {/* Answer Buttons */}
        {gameState.hasPlayed && !gameState.feedback && (
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 ${playfulShapes.shadows.card}`}>
            <h3 className={`${playfulTypography.headings.h3} mb-6 text-center text-purple-600 dark:text-purple-400`}>
              Which side did it come from?
            </h3>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => handleAnswer('left')}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold h-24 w-40"
              >
                <ArrowLeft className="w-8 h-8 mr-2" />
                Left
              </Button>
              <Button
                onClick={() => handleAnswer('center')}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold h-24 w-40"
              >
                Center
              </Button>
              <Button
                onClick={() => handleAnswer('right')}
                disabled={gameState.feedback !== null}
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold h-24 w-40"
              >
                Right
                <ArrowRight className="w-8 h-8 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {gameState.feedback?.show && (
          <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
            gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          } ${playfulShapes.shadows.card} max-w-2xl`}>
            <p className={playfulTypography.headings.h3}>
              {gameState.feedback.isCorrect ? (
                <>
                  <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                  Correct! Great listening!
                  <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                </>
              ) : (
                <>
                  {gameState.currentQuestion && (
                    <>
                      Not quite! The sound came {gameState.currentQuestion.side === 'left' ? 'from the LEFT' : gameState.currentQuestion.side === 'right' ? 'from the RIGHT' : 'from the CENTER'}
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Educational Guide Toggle */}
        <Button
          onClick={() => setShowGuide(!showGuide)}
          variant="outline"
          size="sm"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          {showGuide ? "Hide" : "Show"} Learning Guide
        </Button>

        {showGuide && (
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card} max-w-2xl`}>
            <h3 className={`${playfulTypography.headings.h3} mb-4 text-center text-blue-600 dark:text-blue-400`}>
              👂 Understanding Spatial Audio
            </h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-semibold mb-2">What is Spatial Audio?</h4>
                <p className="text-sm">
                  Spatial audio (or stereo sound) allows you to hear where sounds are coming from - left, right, or center. This is how we locate sounds in the real world!
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How Do We Hear Direction?</h4>
                <p className="text-sm">
                  Your brain uses tiny differences between what your left and right ears hear to figure out where sounds are coming from. Headphones create this effect by playing different volumes in each ear.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Why Is This Important?</h4>
                <p className="text-sm">
                  Spatial hearing helps musicians play together in ensembles, helps us appreciate surround sound in movies, and is essential for understanding how sound works in 3D space!
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Fun Facts:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Owls can pinpoint sounds with incredible accuracy to hunt in darkness</li>
                  <li>Dolphins and bats use echolocation - sound bouncing back - to "see"</li>
                  <li>Modern 3D audio in games and VR uses spatial sound technology</li>
                  <li>Some people have better spatial hearing than others, but everyone can improve with practice!</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips for Better Results:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Use headphones for the best experience</li>
                  <li>Close your eyes to focus on listening</li>
                  <li>Make sure your headphones are on correctly (L = left, R = right)</li>
                  <li>Listen in a quiet environment</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {gameState.totalQuestions > 0 && (
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card}`}>
            <h3 className={`${playfulTypography.headings.h3} mb-3 text-center`}>
              Your Progress
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {gameState.totalQuestions > 0 ? Math.round((gameState.score / gameState.totalQuestions) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {gameState.score}/{gameState.totalQuestions}
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
