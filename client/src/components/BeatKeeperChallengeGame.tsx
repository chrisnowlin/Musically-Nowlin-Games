import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, Pause, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface GameState {
  score: number;
  totalTaps: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean; message: string } | null;
  volume: number;
  currentBeat: number;
  tempo: number;
  hasPlayed: boolean;
}

interface TapTiming {
  tapTime: number;
  expectedTime: number;
  accuracy: number;
}

export default function BeatKeeperChallengeGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalTaps: 0,
    isPlaying: false,
    feedback: null,
    volume: 70,
    currentBeat: 0,
    tempo: 100, // BPM
    hasPlayed: false,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const audioContext = useRef<AudioContext | null>(null);
  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBeatTime = useRef<number>(0);
  const tapHistory = useRef<TapTiming[]>([]);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout, setInterval: setGameInterval } = useGameCleanup();

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

  useEffect(() => {
    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
    };
  }, []);

  const handleStartGame = async () => {
    await initialize();
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
    setGameStarted(true);
  };

  const playBeatSound = useCallback((isTap: boolean = false) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    // Different frequency for tap vs metronome beat
    oscillator.frequency.value = isTap ? 880 : 660;
    oscillator.type = "sine";

    const masterVolume = gameState.volume / 100;
    const volume = (isTap ? 0.2 : 0.3) * masterVolume;
    const startTime = audioContext.current.currentTime;

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.1);
  }, [gameState.volume]);

  const startBeats = useCallback(() => {
    if (!audioContext.current) return;

    setGameState(prev => ({ ...prev, isPlaying: true, currentBeat: 0, hasPlayed: true }));
    lastBeatTime.current = Date.now();
    tapHistory.current = [];

    const beatInterval = (60 / gameState.tempo) * 1000; // ms per beat

    // Play first beat immediately
    playBeatSound();

    beatIntervalRef.current = setGameInterval(() => {
      setGameState(prev => ({ ...prev, currentBeat: prev.currentBeat + 1 }));
      lastBeatTime.current = Date.now();
      playBeatSound();
    }, beatInterval);
  }, [gameState.tempo, playBeatSound, setGameInterval]);

  const stopBeats = useCallback(() => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleTap = useCallback(() => {
    if (!gameState.isPlaying) return;

    const tapTime = Date.now();
    const beatInterval = (60 / gameState.tempo) * 1000;
    const timeSinceLastBeat = tapTime - lastBeatTime.current;

    // Calculate how close the tap was to the beat (0-1, where 0.5 is perfect)
    const beatPhase = (timeSinceLastBeat % beatInterval) / beatInterval;

    // Convert to error from perfect timing (0 = perfect, 0.5 = worst)
    const error = Math.min(beatPhase, 1 - beatPhase);

    // Calculate accuracy percentage (0-100%)
    const accuracy = Math.round((1 - error * 2) * 100);

    playBeatSound(true);

    tapHistory.current.push({
      tapTime,
      expectedTime: lastBeatTime.current,
      accuracy,
    });

    const isGoodTap = accuracy >= 60;

    setGameState(prev => ({
      ...prev,
      score: isGoodTap ? prev.score + 1 : prev.score,
      totalTaps: prev.totalTaps + 1,
      feedback: {
        show: true,
        isCorrect: isGoodTap,
        message: accuracy >= 90 ? "Perfect!" : accuracy >= 75 ? "Great!" : accuracy >= 60 ? "Good!" : "Keep trying!",
      },
    }));

    if (isGoodTap) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    setGameTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, 1000);
  }, [gameState.isPlaying, gameState.tempo, playBeatSound, setGameTimeout]);

  const handleChangeTempo = useCallback((delta: number) => {
    if (gameState.isPlaying) return;

    setGameState(prev => ({
      ...prev,
      tempo: Math.max(60, Math.min(180, prev.tempo + delta)),
    }));
  }, [gameState.isPlaying]);

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
              🥁 Beat Keeper Challenge
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Tap along with the steady beat!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Listen to the steady metronome beat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">👆</span>
                <span>Tap the drum button in time with each beat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⭐</span>
                <span>Score points for accurate timing (60%+ accuracy)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎯</span>
                <span>Try different tempos to practice!</span>
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

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full space-y-8">
        <ScoreDisplay score={gameState.score} total={gameState.totalTaps} />

        <div className="text-center space-y-4">
          <h2 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-gray-200`}>
            Beat Keeper Challenge
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
        </div>

        {/* Tempo Controls */}
        <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card}`}>
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Tempo: {gameState.tempo} BPM
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleChangeTempo(-10)}
                disabled={gameState.isPlaying}
                variant="outline"
                size="sm"
              >
                Slower
              </Button>
              <Button
                onClick={() => handleChangeTempo(10)}
                disabled={gameState.isPlaying}
                variant="outline"
                size="sm"
              >
                Faster
              </Button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {gameState.tempo < 80 && "🐢 Slow"}
              {gameState.tempo >= 80 && gameState.tempo < 120 && "🚶 Moderate"}
              {gameState.tempo >= 120 && gameState.tempo < 150 && "🏃 Fast"}
              {gameState.tempo >= 150 && "⚡ Very Fast"}
            </div>
          </div>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex gap-4">
          {!gameState.isPlaying ? (
            <Button
              onClick={startBeats}
              size="lg"
              className={`${playfulComponents.button.primary}`}
            >
              <Play className="w-6 h-6 mr-2" />
              Start Metronome
            </Button>
          ) : (
            <Button
              onClick={stopBeats}
              size="lg"
              className={`${playfulComponents.button.secondary}`}
            >
              <Pause className="w-6 h-6 mr-2" />
              Stop Metronome
            </Button>
          )}
        </div>

        {/* Tap Button */}
        {gameState.isPlaying && (
          <div className="space-y-4">
            <Button
              onClick={handleTap}
              size="lg"
              className={`w-48 h-48 rounded-full text-6xl ${playfulComponents.button.primary} transform transition-transform active:scale-95`}
            >
              🥁
            </Button>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Tap the drum on each beat!
            </p>
          </div>
        )}

        {/* Beat Indicator */}
        {gameState.isPlaying && (
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              Beat: {gameState.currentBeat + 1}
            </div>
          </div>
        )}

        {/* Feedback */}
        {gameState.feedback?.show && (
          <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
            gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'
          } ${playfulShapes.shadows.card}`}>
            <p className={playfulTypography.headings.h3}>
              {gameState.feedback.isCorrect ? (
                <>
                  <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                  {gameState.feedback.message}
                  <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                </>
              ) : (
                <>{gameState.feedback.message}</>
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
            <h3 className={`${playfulTypography.headings.h3} mb-4 text-center text-purple-600 dark:text-purple-400`}>
              🎵 Understanding Steady Beat
            </h3>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-semibold mb-2">What is a Steady Beat?</h4>
                <p className="text-sm">
                  A steady beat is the regular pulse you feel in music - like a heartbeat! It stays consistent and helps musicians play together in time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What is Tempo?</h4>
                <p className="text-sm">
                  Tempo is the speed of the beat, measured in BPM (Beats Per Minute). A tempo of 60 BPM means one beat per second, while 120 BPM is twice as fast!
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Why Practice This?</h4>
                <p className="text-sm">
                  Keeping a steady beat helps you play or dance with others, follow rhythm patterns, and develop your sense of musical timing. It's a fundamental skill for all musicians!
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tips for Success:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Listen carefully to the metronome clicks</li>
                  <li>Don't rush - let the beat come to you</li>
                  <li>Start with a slow tempo and gradually increase</li>
                  <li>Focus on consistency rather than perfection</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {gameState.totalTaps > 0 && !gameState.isPlaying && gameState.hasPlayed && (
          <div className={`${playfulShapes.rounded.container} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 ${playfulShapes.shadows.card}`}>
            <h3 className={`${playfulTypography.headings.h3} mb-3 text-center`}>
              Session Stats
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {gameState.totalTaps > 0 ? Math.round((gameState.score / gameState.totalTaps) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {gameState.score}/{gameState.totalTaps}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Good Taps</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
