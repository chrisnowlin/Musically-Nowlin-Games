import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Pause, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface GameState {
  score: number;
  totalRounds: number;
  isPlaying: boolean;
  hasStopped: boolean;
  shouldFreeze: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  roundActive: boolean;
  volume: number;
}

export default function MusicalFreezeDanceGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalRounds: 0,
    isPlaying: false,
    hasStopped: false,
    shouldFreeze: false,
    feedback: null,
    roundActive: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [freezeButtonPressed, setFreezeButtonPressed] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout, clearTimeout: clearGameTimeout } = useGameCleanup();

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  const playMusic = useCallback(async () => {
    if (!audioContext.current || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasStopped: false }));
    setFreezeButtonPressed(false);

    const masterVolume = gameState.volume / 100;

    // Play a simple ascending pattern repeatedly
    const melody = [262, 294, 330, 349, 392]; // C D E F G
    const noteDuration = 0.3;

    // Play the melody a few times
    for (let repeat = 0; repeat < 4; repeat++) {
      if (!audioContext.current) break;

      for (const freq of melody) {
        if (!audioContext.current) break;

        const oscillator = audioContext.current.createOscillator();
        const gainNode = audioContext.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current.destination);

        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        const volume = 0.3 * masterVolume;
        const startTime = audioContext.current.currentTime;
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration);

        await new Promise(resolve => setTimeout(resolve, noteDuration * 1000));
      }
    }
  }, [gameState.volume, gameState.isPlaying]);

  const startRound = useCallback(() => {
    // Random time between 2-5 seconds before music stops
    const playDuration = 2000 + Math.random() * 3000;

    setGameState(prev => ({
      ...prev,
      roundActive: true,
      shouldFreeze: false,
      hasStopped: false,
      feedback: null,
    }));

    playMusic();

    // Schedule the music to stop
    setGameTimeout(() => {
      setGameState(prev => ({ ...prev, isPlaying: false, hasStopped: true, shouldFreeze: true }));

      // Check if user pressed freeze in time
      setGameTimeout(() => {
        const pressedInTime = freezeButtonPressed;

        setGameState(prev => ({
          ...prev,
          score: pressedInTime ? prev.score + 1 : prev.score,
          totalRounds: prev.totalRounds + 1,
          feedback: { show: true, isCorrect: pressedInTime },
          roundActive: false,
        }));

        if (pressedInTime) {
          audioService.playSuccessTone();
        } else {
          audioService.playErrorTone();
        }

        // Start next round after feedback
        setGameTimeout(() => {
          startRound();
        }, 2500);
      }, 1000); // 1 second window to press freeze after music stops
    }, playDuration);
  }, [playMusic, freezeButtonPressed, setGameTimeout]);

  const handleFreeze = useCallback(() => {
    if (!gameState.roundActive || gameState.feedback) return;

    setFreezeButtonPressed(true);

    // If music hasn't stopped yet, they pressed too early
    if (gameState.isPlaying) {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        score: prev.score, // Don't add point for early press
        totalRounds: prev.totalRounds + 1,
        feedback: { show: true, isCorrect: false },
        roundActive: false,
      }));

      audioService.playErrorTone();

      // Start next round
      setGameTimeout(() => {
        startRound();
      }, 2500);
    }
  }, [gameState, startRound, setGameTimeout]);

  const handleStartGame = async () => {
    await initialize();
    setGameStarted(true);
    setGameTimeout(() => {
      startRound();
    }, 1000);
  };

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
              Musical Freeze Dance
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Freeze when the music stops!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🕺</span>
                <span>Listen to the music playing</span>
              </li>
              <li className="flex items-start gap-2">
                <Pause className="w-6 h-6 text-orange-500" />
                <span>When the music stops, quickly press the FREEZE button!</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Don't press too early or too late!</span>
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
        <ScoreDisplay score={gameState.score} total={gameState.totalRounds} />

        <div className="mt-8 mb-8">
          <h2 className={`${playfulTypography.headings.h2} text-center text-gray-800 dark:text-gray-200`}>
            Musical Freeze Dance
          </h2>
          <p className="text-center text-xl font-bold mt-4 text-gray-700 dark:text-gray-300">
            {gameState.isPlaying ? "🎵 Music Playing... 🎵" : gameState.hasStopped ? "⏸️ MUSIC STOPPED!" : "Get Ready..."}
          </p>
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

        {/* Freeze Button */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <div className="flex flex-col items-center gap-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 text-center`}>
              Press FREEZE when the music stops!
            </p>

            <Button
              onClick={handleFreeze}
              disabled={!gameState.roundActive || gameState.feedback !== null}
              size="lg"
              className={`
                ${freezeButtonPressed ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700'}
                text-white px-16 py-16 text-4xl font-bold rounded-full transform transition-all
                ${gameState.roundActive && !gameState.feedback ? 'hover:scale-110 shadow-2xl' : 'opacity-50'}
              `}
            >
              <Pause className="w-16 h-16 mr-4" />
              FREEZE!
            </Button>
          </div>

          {/* Feedback */}
          {gameState.feedback?.show && (
            <div className={`mt-6 text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Perfect Freeze! Great timing!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    {gameState.isPlaying ? "Too Early! Wait for the music to stop!" : "Too Late! Press faster next time!"}
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Musical Timing & Reaction Skills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
              <p className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                Auditory Attention
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Musicians must listen carefully and react to changes in music. This game develops
                your ability to notice when music stops or changes.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                Timing & Rhythm
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Good timing is essential in music. This game helps you develop quick reactions
                and precise timing skills.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Skill:</strong> Being able to stop exactly on time is important for playing
              in ensembles, following a conductor, and playing with precision. Musicians call these sudden stops
              "cutoffs" and they require careful listening and quick reactions!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
