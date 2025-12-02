import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Music, BookOpen, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useAudioService } from "@/hooks/useAudioService";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import AudioErrorFallback from "@/components/AudioErrorFallback";

interface MusicOption {
  melody: number[];
  tempo: number; // note duration
  volume: number; // relative volume
  oscillatorType: OscillatorType;
}

interface StoryScenario {
  story: string;
  emoji: string;
  correctOption: 0 | 1;
  options: [MusicOption, MusicOption];
  explanation: string;
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: number | null; // Which option is playing (0 or 1) or null
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentScenario: StoryScenario | null;
  hasPlayedBoth: { option0: boolean; option1: boolean };
  volume: number;
}

// Story scenarios with musical options
const STORY_SCENARIOS: StoryScenario[] = [
  {
    story: "The sun is rising over the mountains. Birds begin to sing as the world wakes up.",
    emoji: "🌅",
    correctOption: 0,
    options: [
      {
        melody: [262, 330, 392, 523, 659], // C E G C E - ascending, bright
        tempo: 0.4,
        volume: 0.35,
        oscillatorType: "sine",
      },
      {
        melody: [523, 466, 415, 349, 311, 262], // Descending, somber
        tempo: 0.6,
        volume: 0.25,
        oscillatorType: "triangle",
      },
    ],
    explanation: "Sunrise music is typically ascending, bright, and growing in volume - like Option 1!",
  },
  {
    story: "A gentle rain falls softly as someone drifts off to sleep in a cozy bed.",
    emoji: "💤",
    correctOption: 1,
    options: [
      {
        melody: [392, 440, 494, 523], // Fast, energetic
        tempo: 0.2,
        volume: 0.4,
        oscillatorType: "sine",
      },
      {
        melody: [349, 330, 294, 262], // Slow, gentle descent
        tempo: 0.8,
        volume: 0.2,
        oscillatorType: "sine",
      },
    ],
    explanation: "Lullaby music is slow, soft, and gentle - perfect for sleep like Option 2!",
  },
  {
    story: "A brave hero runs through the forest, chasing after the villain who stole the treasure!",
    emoji: "🏃",
    correctOption: 0,
    options: [
      {
        melody: [330, 330, 392, 392, 440, 440, 494], // Fast, rhythmic
        tempo: 0.15,
        volume: 0.4,
        oscillatorType: "sawtooth",
      },
      {
        melody: [262, 294, 330, 349], // Slow, peaceful
        tempo: 0.6,
        volume: 0.25,
        oscillatorType: "sine",
      },
    ],
    explanation: "Chase scenes need fast, rhythmic, energetic music like Option 1!",
  },
  {
    story: "The princess walks into the mysterious castle. Strange shadows flicker on the walls.",
    emoji: "🏰",
    correctOption: 1,
    options: [
      {
        melody: [262, 294, 330, 349, 392], // Happy, major
        tempo: 0.4,
        volume: 0.35,
        oscillatorType: "sine",
      },
      {
        melody: [262, 277, 294, 311, 277, 262], // Mysterious, minor
        tempo: 0.5,
        volume: 0.25,
        oscillatorType: "triangle",
      },
    ],
    explanation: "Mysterious scenes use softer, minor-key music with unusual intervals - like Option 2!",
  },
  {
    story: "The party is in full swing! Everyone is dancing and laughing together.",
    emoji: "🎉",
    correctOption: 0,
    options: [
      {
        melody: [262, 330, 392, 523, 392, 330, 262, 330], // Bouncy, major
        tempo: 0.25,
        volume: 0.4,
        oscillatorType: "sine",
      },
      {
        melody: [262, 247, 233, 220], // Descending, slow
        tempo: 0.7,
        volume: 0.2,
        oscillatorType: "sine",
      },
    ],
    explanation: "Party music is fast, bouncy, and in a major key - Option 1 captures the joy!",
  },
  {
    story: "A storm is approaching. Thunder rumbles and lightning flashes across the dark sky.",
    emoji: "⛈️",
    correctOption: 1,
    options: [
      {
        melody: [330, 349, 392, 440], // Gentle, ascending
        tempo: 0.5,
        volume: 0.25,
        oscillatorType: "sine",
      },
      {
        melody: [220, 233, 196, 208, 185, 220], // Chaotic, loud
        tempo: 0.2,
        volume: 0.45,
        oscillatorType: "sawtooth",
      },
    ],
    explanation: "Storm music is loud, fast, and chaotic with dramatic changes - like Option 2!",
  },
];

export default function MusicalStoryTimeGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: null,
    feedback: null,
    currentScenario: null,
    hasPlayedBoth: { option0: false, option1: false },
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

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

  useEffect(() => {
    if (gameStarted && !gameState.currentScenario) {
      generateNewScenario();
    }
  }, [gameStarted]);

  const playMusicOption = useCallback(async (option: MusicOption) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;

    for (const freq of option.melody) {
      if (!audioContext.current) break;

      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.value = freq;
      oscillator.type = option.oscillatorType;

      const volume = option.volume * masterVolume;
      const startTime = audioContext.current.currentTime;
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + option.tempo);

      oscillator.start(startTime);
      oscillator.stop(startTime + option.tempo);

      await new Promise(resolve => setGameTimeout(resolve, option.tempo * 1000));
    }
  }, [gameState.volume, setGameTimeout]);

  const handlePlayOption = useCallback(async (optionIndex: 0 | 1) => {
    if (!gameState.currentScenario || gameState.isPlaying !== null || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: optionIndex }));

    // Mark this option as played
    const playedKey = optionIndex === 0 ? "option0" : "option1";
    setGameState(prev => ({
      ...prev,
      hasPlayedBoth: { ...prev.hasPlayedBoth, [playedKey]: true },
    }));

    await playMusicOption(gameState.currentScenario.options[optionIndex]);

    setGameState(prev => ({ ...prev, isPlaying: null }));
  }, [gameState.currentScenario, gameState.isPlaying, gameState.feedback, playMusicOption]);

  const generateNewScenario = useCallback(() => {
    const scenario = STORY_SCENARIOS[Math.floor(Math.random() * STORY_SCENARIOS.length)];

    setGameState(prev => ({
      ...prev,
      currentScenario: scenario,
      hasPlayedBoth: { option0: false, option1: false },
      feedback: null,
    }));
  }, []);

  const handleAnswer = useCallback((chosenOption: 0 | 1) => {
    if (!gameState.currentScenario || gameState.feedback) return;

    // Require both options to be played before answering
    if (!gameState.hasPlayedBoth.option0 || !gameState.hasPlayedBoth.option1) {
      return;
    }

    const isCorrect = chosenOption === gameState.currentScenario.correctOption;

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
      generateNewScenario();
    }, 3500);
  }, [gameState.currentScenario, gameState.feedback, gameState.hasPlayedBoth, generateNewScenario, setGameTimeout]);

  const handleStartGame = async () => {
    await initialize();
    setGameStarted(true);
  };

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
              Musical Story Time
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Choose your musical adventure!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <BookOpen className="w-6 h-6 text-orange-500" />
                <span>Read each story scenario carefully</span>
              </li>
              <li className="flex items-start gap-2">
                <Music className="w-6 h-6 text-purple-500" />
                <span>Listen to both musical options</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Choose which music fits the story best!</span>
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
            Musical Story Time
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
              disabled={gameState.isPlaying !== null}
            />
            <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[45px]">
              {gameState.volume}%
            </span>
          </div>
        </div>

        {/* Story Scenario */}
        {gameState.currentScenario && (
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} w-full max-w-2xl space-y-6`}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{gameState.currentScenario.emoji}</div>
              <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
                {gameState.currentScenario.story}
              </p>
              <p className={`${playfulTypography.body.medium} text-purple-600 dark:text-purple-400 mt-4`}>
                Which music fits this story better?
              </p>
            </div>

            {/* Music Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handlePlayOption(0)}
                  disabled={gameState.isPlaying !== null || gameState.feedback !== null}
                  size="lg"
                  className={`bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-8 text-xl font-bold ${
                    gameState.isPlaying === 0 ? 'ring-4 ring-blue-300 animate-pulse' : ''
                  } ${
                    gameState.hasPlayedBoth.option0 ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  <Music className="w-6 h-6 mr-2" />
                  {gameState.isPlaying === 0 ? 'Playing...' : 'Option 1'}
                </Button>
                {gameState.hasPlayedBoth.option0 && (
                  <span className="text-sm text-green-600 dark:text-green-400 text-center">✓ Played</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handlePlayOption(1)}
                  disabled={gameState.isPlaying !== null || gameState.feedback !== null}
                  size="lg"
                  className={`bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-8 py-8 text-xl font-bold ${
                    gameState.isPlaying === 1 ? 'ring-4 ring-pink-300 animate-pulse' : ''
                  } ${
                    gameState.hasPlayedBoth.option1 ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  <Music className="w-6 h-6 mr-2" />
                  {gameState.isPlaying === 1 ? 'Playing...' : 'Option 2'}
                </Button>
                {gameState.hasPlayedBoth.option1 && (
                  <span className="text-sm text-green-600 dark:text-green-400 text-center">✓ Played</span>
                )}
              </div>
            </div>

            {/* Answer Buttons */}
            {gameState.hasPlayedBoth.option0 && gameState.hasPlayedBoth.option1 && !gameState.feedback && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleAnswer(0)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-6 text-xl font-bold"
                >
                  Choose Option 1
                </Button>
                <Button
                  onClick={() => handleAnswer(1)}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-6 text-xl font-bold"
                >
                  Choose Option 2
                </Button>
              </div>
            )}

            {!gameState.hasPlayedBoth.option0 || !gameState.hasPlayedBoth.option1 ? (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Listen to both options before making your choice!
              </p>
            ) : null}

            {/* Feedback */}
            {gameState.feedback?.show && (
              <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
                gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              }`}>
                <p className={playfulTypography.headings.h3}>
                  {gameState.feedback.isCorrect ? (
                    <>
                      <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                      Perfect choice! {gameState.currentScenario.explanation}
                      <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                    </>
                  ) : (
                    <>
                      Option {gameState.currentScenario.correctOption + 1} was the better fit! {gameState.currentScenario.explanation}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Music & Storytelling
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
              <p className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                Program Music
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Music that tells a story or paints a picture is called "program music." Composers use
                tempo, volume, and melody to match emotions and scenes.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                Musical Elements
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Fast music = excitement or chase scenes. Slow music = calm or sad scenes.
                Loud = powerful moments. Soft = gentle or mysterious moments.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Skill:</strong> Film composers, video game music creators, and classical composers
              all use these techniques to make music that enhances stories. Famous examples include Peter and the Wolf
              by Prokofiev and The Sorcerer's Apprentice by Dukas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
