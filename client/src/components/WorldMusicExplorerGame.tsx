import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Globe, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

type RegionType = "african" | "asian" | "latin" | "middleEastern" | "celtic";

interface WorldRegion {
  type: RegionType;
  name: string;
  emoji: string;
  description: string;
  color: string;
  pattern: {
    notes: number[];
    durations: number[];
    volumes: number[];
  };
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentRegion: WorldRegion | null;
  answerOptions: WorldRegion[];
  hasPlayed: boolean;
  volume: number;
}

// World music regions with characteristic patterns
const WORLD_REGIONS: WorldRegion[] = [
  {
    type: "african",
    name: "African",
    emoji: "🌍",
    description: "Strong rhythmic patterns with polyrhythms and syncopation",
    color: "from-amber-500 to-orange-600",
    pattern: {
      // Polyrhythmic pattern with emphasis
      notes: [262, 262, 294, 262, 262, 330, 262, 294],
      durations: [0.25, 0.25, 0.3, 0.2, 0.25, 0.3, 0.2, 0.3],
      volumes: [1.0, 0.6, 0.9, 0.6, 1.0, 0.9, 0.6, 0.8],
    },
  },
  {
    type: "asian",
    name: "Asian",
    emoji: "🏮",
    description: "Pentatonic scale (5-note) with flowing, meditative quality",
    color: "from-red-500 to-pink-600",
    pattern: {
      // Pentatonic: C D E G A (no F or B)
      notes: [262, 294, 330, 392, 440, 392, 330, 294],
      durations: [0.5, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.6],
      volumes: [0.8, 0.7, 0.8, 0.7, 0.9, 0.7, 0.8, 0.9],
    },
  },
  {
    type: "latin",
    name: "Latin",
    emoji: "💃",
    description: "Syncopated rhythms with infectious dance beats",
    color: "from-yellow-500 to-red-600",
    pattern: {
      // Clave-inspired syncopated pattern
      notes: [330, 349, 330, 294, 330, 349, 392, 349],
      durations: [0.25, 0.15, 0.25, 0.35, 0.25, 0.15, 0.4, 0.4],
      volumes: [1.0, 0.7, 0.8, 0.6, 1.0, 0.7, 0.9, 0.8],
    },
  },
  {
    type: "middleEastern",
    name: "Middle Eastern",
    emoji: "🕌",
    description: "Modal melodies with exotic scales and ornamental patterns",
    color: "from-indigo-500 to-purple-600",
    pattern: {
      // Phrygian-like mode (approximation)
      notes: [294, 311, 349, 392, 415, 349, 311, 294],
      durations: [0.4, 0.3, 0.4, 0.5, 0.6, 0.4, 0.3, 0.5],
      volumes: [0.9, 0.7, 0.8, 0.9, 1.0, 0.8, 0.7, 0.9],
    },
  },
  {
    type: "celtic",
    name: "Celtic",
    emoji: "☘️",
    description: "Lively jigs and reels with bouncy, dance-like feel",
    color: "from-green-500 to-emerald-600",
    pattern: {
      // Jig pattern (compound meter feel)
      notes: [294, 330, 349, 330, 294, 262, 294, 330],
      durations: [0.2, 0.2, 0.3, 0.2, 0.2, 0.3, 0.2, 0.4],
      volumes: [1.0, 0.7, 0.9, 0.7, 1.0, 0.8, 0.7, 0.9],
    },
  },
];

export default function WorldMusicExplorerGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentRegion: null,
    answerOptions: [],
    hasPlayed: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.currentRegion) {
      generateNewQuestion();
    }
  }, [gameStarted]);

  const playRegionalPattern = useCallback(async (region: WorldRegion) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;

    for (let i = 0; i < region.pattern.notes.length; i++) {
      const freq = region.pattern.notes[i];
      const duration = region.pattern.durations[i];
      const relativeVolume = region.pattern.volumes[i];

      if (!audioContext.current) break;

      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const volume = 0.3 * masterVolume * relativeVolume;
      const startTime = audioContext.current.currentTime;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);

      await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
  }, [gameState.volume]);

  const generateNewQuestion = useCallback(() => {
    // Pick a random region
    const correctRegion = WORLD_REGIONS[Math.floor(Math.random() * WORLD_REGIONS.length)];

    // Pick 3 other random regions as wrong answers
    const wrongOptions = WORLD_REGIONS.filter(r => r.type !== correctRegion.type);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);

    // Combine and shuffle all options
    const allOptions = [correctRegion, ...shuffledWrong].sort(() => Math.random() - 0.5);

    setGameState(prev => ({
      ...prev,
      currentRegion: correctRegion,
      answerOptions: allOptions,
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayPattern = useCallback(async () => {
    if (!gameState.currentRegion || gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    await playRegionalPattern(gameState.currentRegion);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentRegion, gameState.isPlaying, gameState.feedback, playRegionalPattern]);

  const handleAnswer = useCallback((selectedRegion: WorldRegion) => {
    if (!gameState.currentRegion || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = selectedRegion.type === gameState.currentRegion.type;

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

    setTimeout(() => {
      generateNewQuestion();
    }, 3500);
  }, [gameState.currentRegion, gameState.hasPlayed, gameState.feedback, generateNewQuestion]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
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
              World Music Explorer
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Match music styles to world regions!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Globe className="w-6 h-6 text-blue-500" />
                <span>Listen to a music pattern from around the world</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🌍</span>
                <span>Identify which region's music style you hear</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about world music and cultural diversity!</span>
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
            World Music Explorer
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
              Listen to the musical pattern
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayPattern}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} ${
                gameState.isPlaying ? 'animate-pulse' : ''
              }`}
            >
              <Globe className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : gameState.hasPlayed ? 'Play Again' : 'Play Pattern'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="space-y-4">
              <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Which region does this music come from?
              </p>
              <div className="grid grid-cols-2 gap-4">
                {gameState.answerOptions.map((region) => (
                  <Button
                    key={region.type}
                    onClick={() => handleAnswer(region)}
                    size="lg"
                    className={`bg-gradient-to-r ${region.color} hover:opacity-80 text-white px-6 py-8 text-xl font-bold flex flex-col items-center gap-2`}
                  >
                    <span className="text-5xl">{region.emoji}</span>
                    <span>{region.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!gameState.hasPlayed && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click the button above to hear the musical pattern!
            </p>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && gameState.currentRegion && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! It was {gameState.currentRegion.emoji} {gameState.currentRegion.name}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    It was {gameState.currentRegion.emoji} {gameState.currentRegion.name}!
                  </>
                )}
              </p>
              <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                {gameState.currentRegion.description}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            World Music Styles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {WORLD_REGIONS.map((region) => (
              <div key={region.type} className={`bg-gradient-to-r ${region.color} bg-opacity-10 p-4 rounded-lg`}>
                <p className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <span className="text-2xl">{region.emoji}</span>
                  {region.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-xs">
                  {region.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Cultural Diversity:</strong> Music from different regions of the world has unique
              characteristics shaped by culture, history, and geography. African music often features
              complex rhythms and polyrhythms. Asian music uses pentatonic scales (5 notes). Latin music
              has syncopated, danceable rhythms. Middle Eastern music uses modal scales with ornamental
              patterns. Celtic music features lively dance rhythms like jigs and reels. Learning to
              recognize these styles helps us appreciate the rich diversity of human musical expression!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
