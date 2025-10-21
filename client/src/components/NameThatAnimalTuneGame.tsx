import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Music, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { usePhilharmoniaInstruments } from "@/hooks/usePhilharmoniaInstruments";

interface AnimalTheme {
  name: string;
  emoji: string;
  melody: string[]; // Changed from frequencies to note names for Philharmonia
  tempo: number; // note duration
  oscillatorType: OscillatorType;
  description: string;
  philharmoniaName: string; // Maps to Philharmonia library instrument
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentAnimal: AnimalTheme | null;
  answerOptions: AnimalTheme[];
  hasPlayed: boolean;
  volume: number;
}

// Animal musical themes using Philharmonia Orchestra instruments - each has a distinct character
const ANIMAL_THEMES: AnimalTheme[] = [
  {
    name: "Elephant",
    emoji: "🐘",
    melody: ["G3", "A3", "G3", "A3", "G3"], // Low, slow, heavy
    tempo: 0.8,
    oscillatorType: "triangle",
    description: "Elephants get low, slow, heavy music that feels like big footsteps",
    philharmoniaName: "cello", // Deep, low instrument
  },
  {
    name: "Bird",
    emoji: "🐦",
    melody: ["E5", "G5", "A5", "C6", "A5", "G5"], // High, fast, chirpy
    tempo: 0.2,
    oscillatorType: "sine",
    description: "Birds get high, fast, light music that flutters like wings",
    philharmoniaName: "flute", // Bright, high instrument
  },
  {
    name: "Rabbit",
    emoji: "🐰",
    melody: ["A4", "A4", "C5", "A4", "A4", "C5", "A4", "A4"], // Quick hops
    tempo: 0.15,
    oscillatorType: "sine",
    description: "Rabbits get quick, bouncy music that hops along",
    philharmoniaName: "violin", // Light, nimble
  },
  {
    name: "Whale",
    emoji: "🐋",
    melody: ["A2", "D3", "E3", "G3", "E3", "D3"], // Deep, smooth
    tempo: 1.2,
    oscillatorType: "sine",
    description: "Whales get very low, smooth, flowing music like deep ocean sounds",
    philharmoniaName: "tuba", // Deepest instrument
  },
  {
    name: "Bee",
    emoji: "🐝",
    melody: ["D5", "D#5", "D5", "D#5", "D5", "D#5", "D5"], // Fast buzzing
    tempo: 0.1,
    oscillatorType: "sawtooth",
    description: "Bees get fast, buzzing music that sounds busy and repetitive",
    philharmoniaName: "clarinet", // Reedy, can sound buzzy
  },
  {
    name: "Lion",
    emoji: "🦁",
    melody: ["C4", "E4", "G4", "C5", "G4", "E4"], // Bold, strong
    tempo: 0.5,
    oscillatorType: "sawtooth",
    description: "Lions get bold, strong music with powerful notes",
    philharmoniaName: "trumpet", // Powerful, bold
  },
  {
    name: "Snake",
    emoji: "🐍",
    melody: ["D4", "C#4", "C4", "B3", "A#3", "A3"], // Slithering descent
    tempo: 0.4,
    oscillatorType: "triangle",
    description: "Snakes get sliding, mysterious music that moves smoothly down",
    philharmoniaName: "oboe", // Mysterious, exotic
  },
  {
    name: "Butterfly",
    emoji: "🦋",
    melody: ["C5", "E5", "G5", "E5", "C5", "E5"], // Light, fluttery
    tempo: 0.3,
    oscillatorType: "sine",
    description: "Butterflies get gentle, floating music that dances in the air",
    philharmoniaName: "glockenspiel", // Delicate, sparkling
  },
];

export default function NameThatAnimalTuneGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentAnimal: null,
    answerOptions: [],
    hasPlayed: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  // Load all Philharmonia instruments used for animal themes
  const {
    isLoading: instrumentsLoading,
    loadingProgress,
    playMelody: playPhilharmoniaMelody,
  } = usePhilharmoniaInstruments([
    'cello', 'flute', 'violin', 'tuba', 'clarinet', 'trumpet', 'oboe', 'glockenspiel'
  ]);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.currentAnimal) {
      generateNewQuestion();
    }
  }, [gameStarted]);

  const playAnimalTheme = useCallback(async (animal: AnimalTheme) => {
    const masterVolume = gameState.volume / 100;

    try {
      await playPhilharmoniaMelody(animal.philharmoniaName, animal.melody, animal.tempo, {
        volume: masterVolume,
      });
    } catch (error) {
      console.error("Error playing Philharmonia animal theme:", error);
    }
  }, [gameState.volume, playPhilharmoniaMelody]);

  const generateNewQuestion = useCallback(() => {
    // Pick a random animal as the correct answer
    const correctAnimal = ANIMAL_THEMES[Math.floor(Math.random() * ANIMAL_THEMES.length)];

    // Pick 3 other random animals as wrong answers
    const wrongOptions = ANIMAL_THEMES.filter(a => a.name !== correctAnimal.name);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);

    // Combine and shuffle all options
    const allOptions = [correctAnimal, ...shuffledWrong].sort(() => Math.random() - 0.5);

    setGameState(prev => ({
      ...prev,
      currentAnimal: correctAnimal,
      answerOptions: allOptions,
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlayTheme = useCallback(async () => {
    if (!gameState.currentAnimal || gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    await playAnimalTheme(gameState.currentAnimal);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.currentAnimal, gameState.isPlaying, gameState.feedback, playAnimalTheme]);

  const handleAnswer = useCallback((selectedAnimal: AnimalTheme) => {
    if (!gameState.currentAnimal || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = selectedAnimal.name === gameState.currentAnimal.name;

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
    }, 3000);
  }, [gameState.currentAnimal, gameState.hasPlayed, gameState.feedback, generateNewQuestion]);

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
              Name That Animal Tune
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Which animal does this theme belong to?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-green-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Music className="w-6 h-6 text-green-500" />
                <span>Listen to a musical theme for an animal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🤔</span>
                <span>Guess which animal the theme belongs to</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about leitmotifs and character themes!</span>
              </li>
            </ul>
          </div>

          {instrumentsLoading ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Loading Philharmonia Orchestra Samples...
                </p>
                <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round(loadingProgress)}%
                </p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleStartGame}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-8 h-8 mr-3" />
              Start Playing!
            </Button>
          )}
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
            Name That Animal Tune
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

        {/* Play Theme */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} w-full max-w-2xl space-y-6`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to this animal's musical theme
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlayTheme}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} ${
                gameState.isPlaying ? 'animate-pulse' : ''
              }`}
            >
              <Music className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing Theme...' : gameState.hasPlayed ? 'Play Again' : 'Play Animal Theme'}
            </Button>
          </div>

          {/* Animal Options */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="space-y-4">
              <p className="text-center text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                Which animal does this theme belong to?
              </p>
              <div className="grid grid-cols-2 gap-4">
                {gameState.answerOptions.map((animal) => (
                  <Button
                    key={animal.name}
                    onClick={() => handleAnswer(animal)}
                    size="lg"
                    className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-8 text-2xl font-bold flex flex-col items-center gap-2"
                  >
                    <span className="text-4xl">{animal.emoji}</span>
                    <span className="text-lg">{animal.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!gameState.hasPlayed && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click the button above to hear the animal's theme!
            </p>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && gameState.currentAnimal && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! It was the {gameState.currentAnimal.emoji} {gameState.currentAnimal.name}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    It was the {gameState.currentAnimal.emoji} {gameState.currentAnimal.name}!
                  </>
                )}
              </p>
              <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                {gameState.currentAnimal.description}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Musical Themes & Leitmotifs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="font-bold text-green-600 dark:text-green-400 mb-2">
                Leitmotifs
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                A leitmotif is a short musical phrase that represents a specific character, place, or idea.
                Composers use tempo, pitch, and rhythm to match a character's personality!
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                Character Themes
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Fast music = small, quick animals. Slow music = large, heavy animals.
                High notes = light, flying creatures. Low notes = big, powerful animals.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Famous Example:</strong> Prokofiev's "Peter and the Wolf" uses different instruments and themes
              for each character. The bird is a flute, the wolf is horns, and the duck is an oboe. Movie composers
              like John Williams use leitmotifs too - think of the Jaws theme or Star Wars character themes!
            </p>
          </div>
          <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>🎵 Real Orchestra Sounds:</strong> This game uses authentic Philharmonia Orchestra samples,
              so you're hearing real instruments matched to each animal! Notice how a deep cello sounds perfect for
              an elephant, while a high flute captures a bird's flight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
