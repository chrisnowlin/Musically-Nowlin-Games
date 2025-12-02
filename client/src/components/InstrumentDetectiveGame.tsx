import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Music2, Mic, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { usePhilharmoniaInstruments } from "@/hooks/usePhilharmoniaInstruments";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentInstrument: {
    family: "strings" | "woodwinds" | "brass" | "percussion";
    sound: InstrumentSound;
  } | null;
  hasPlayed: boolean;
  volume: number;
}

interface InstrumentSound {
  family: "strings" | "woodwinds" | "brass" | "percussion";
  name: string;
  notes: string[]; // Changed from frequencies to note names for Philharmonia
  pattern: "melody" | "rhythm" | "sustained" | "pizzicato";
  philharmoniaName: string; // Maps to Philharmonia library instrument name
}

// Instrument family sounds with characteristic patterns using Philharmonia Orchestra samples
// Notes are mapped to actual available samples in instrumentLibrary
const INSTRUMENT_SOUNDS: InstrumentSound[] = [
  // Strings - warm, sustained tones
  {
    family: "strings",
    name: "Violin",
    notes: ["G4", "A4", "C5", "D5", "E5"],  // Available: G4, A4, C5, D5, E5
    pattern: "melody",
    philharmoniaName: "violin"
  },
  {
    family: "strings",
    name: "Cello",
    notes: ["C3", "E3", "G3", "C4"],  // Available: C3, E3, G3, C4
    pattern: "sustained",
    philharmoniaName: "cello"
  },
  {
    family: "strings",
    name: "Violin Pizzicato",
    notes: ["G4", "C5", "E5"],  // Available: G4, C5, E5
    pattern: "pizzicato",
    philharmoniaName: "violin"
  },
  // Woodwinds - airy, bright tones
  {
    family: "woodwinds",
    name: "Flute",
    notes: ["C5", "D5", "E5", "G5", "A5"],  // Available: C5, D5, E5, G5, A5
    pattern: "melody",
    philharmoniaName: "flute"
  },
  {
    family: "woodwinds",
    name: "Clarinet",
    notes: ["C4", "E4", "G4"],  // Available: C4, E4, G4
    pattern: "melody",
    philharmoniaName: "clarinet"
  },
  {
    family: "woodwinds",
    name: "Oboe",
    notes: ["C4", "E4", "G4"],  // Available: C4, E4, G4
    pattern: "sustained",
    philharmoniaName: "oboe"
  },
  // Brass - bold, powerful tones
  {
    family: "brass",
    name: "Trumpet",
    notes: ["C4", "E4", "G4"],  // Available: C4, E4, G4
    pattern: "melody",
    philharmoniaName: "trumpet"
  },
  {
    family: "brass",
    name: "French Horn",
    notes: ["C3", "E3", "G3"],  // Available: C3, E3, G3
    pattern: "sustained",
    philharmoniaName: "french-horn"
  },
  {
    family: "brass",
    name: "Tuba",
    notes: ["A1", "A2", "A2"],  // Available: A1, A2
    pattern: "sustained",
    philharmoniaName: "tuba"
  },
  // Percussion - rhythmic, percussive sounds
  {
    family: "percussion",
    name: "Timpani",
    notes: ["C2", "E2", "G2", "C2"],  // Available: C2, E2, G2
    pattern: "rhythm",
    philharmoniaName: "timpani"
  },
  {
    family: "percussion",
    name: "Xylophone",
    notes: ["C5", "E5", "G5"],  // Available: C5, E5, G5
    pattern: "pizzicato",
    philharmoniaName: "xylophone"
  },
  {
    family: "percussion",
    name: "Glockenspiel",
    notes: ["C6", "E6", "G6"],  // Available: C6, E6, G6
    pattern: "sustained",
    philharmoniaName: "glockenspiel"
  },
];

export default function InstrumentDetectiveGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    currentInstrument: null,
    hasPlayed: false,
    volume: 50,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  // Load all Philharmonia instruments used in the game
  const {
    isLoading: instrumentsLoading,
    loadingProgress,
    playMelody: playPhilharmoniaMelody,
    playNote: playPhilharmoniaNote,
  } = usePhilharmoniaInstruments([
    'violin', 'cello', 'flute', 'clarinet', 'oboe',
    'trumpet', 'french-horn', 'tuba', 'timpani', 'xylophone', 'glockenspiel'
  ]);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.currentInstrument) {
      generateNewInstrument();
    }
  }, [gameStarted]);

  const playInstrumentSound = useCallback(async (sound: InstrumentSound) => {
    if (gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    const masterVolume = gameState.volume / 100;

    try {
      if (sound.pattern === "melody") {
        // Smooth melodic line
        const noteDuration = 0.45;
        await playPhilharmoniaMelody(sound.philharmoniaName, sound.notes, noteDuration, {
          volume: masterVolume,
        });

      } else if (sound.pattern === "sustained") {
        // Long sustained note
        const noteDuration = 2.0;
        await playPhilharmoniaNote(sound.philharmoniaName, sound.notes[0], {
          volume: masterVolume,
          duration: noteDuration,
        });

      } else if (sound.pattern === "pizzicato") {
        // Short plucked notes
        const noteDuration = 0.2;
        await playPhilharmoniaMelody(sound.philharmoniaName, sound.notes, noteDuration, {
          volume: masterVolume,
        });

      } else if (sound.pattern === "rhythm") {
        // Rhythmic pattern
        const noteDuration = 0.35;
        await playPhilharmoniaMelody(sound.philharmoniaName, sound.notes, noteDuration, {
          volume: masterVolume,
        });
      }
    } catch (error) {
      console.error("Error playing Philharmonia sound:", error);
    }

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.volume, gameState.isPlaying, playPhilharmoniaMelody, playPhilharmoniaNote]);

  const generateNewInstrument = useCallback(() => {
    const randomSound = INSTRUMENT_SOUNDS[Math.floor(Math.random() * INSTRUMENT_SOUNDS.length)];

    setGameState(prev => ({
      ...prev,
      currentInstrument: {
        family: randomSound.family,
        sound: randomSound,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, []);

  const handlePlaySound = useCallback(() => {
    if (gameState.currentInstrument) {
      playInstrumentSound(gameState.currentInstrument.sound);
    }
  }, [gameState.currentInstrument, playInstrumentSound]);

  const handleAnswer = useCallback((guessFamily: "strings" | "woodwinds" | "brass" | "percussion") => {
    if (!gameState.currentInstrument || !gameState.hasPlayed || gameState.feedback) return;

    const isCorrect = guessFamily === gameState.currentInstrument.family;

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
      generateNewInstrument();
    }, 2500);
  }, [gameState.currentInstrument, gameState.hasPlayed, gameState.feedback, generateNewInstrument]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
  };

  const decorativeOrbs = generateDecorativeOrbs();

  const FAMILY_INFO = {
    strings: {
      name: "Strings",
      emoji: "🎻",
      color: "from-amber-400 to-amber-500",
      hoverColor: "from-amber-500 to-amber-600",
      description: "Warm, singing tones from bowed or plucked strings"
    },
    woodwinds: {
      name: "Woodwinds",
      emoji: "🎷",
      color: "from-green-400 to-green-500",
      hoverColor: "from-green-500 to-green-600",
      description: "Airy, bright sounds from wind instruments"
    },
    brass: {
      name: "Brass",
      emoji: "🎺",
      color: "from-yellow-400 to-yellow-500",
      hoverColor: "from-yellow-500 to-yellow-600",
      description: "Bold, powerful tones from metal instruments"
    },
    percussion: {
      name: "Percussion",
      emoji: "🥁",
      color: "from-red-400 to-red-500",
      hoverColor: "from-red-500 to-red-600",
      description: "Rhythmic, struck sounds"
    }
  };

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
              Instrument Detective
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Can you identify which family each instrument belongs to?
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-red-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Mic className="w-6 h-6 text-red-500" />
                <span>Listen to the sound of a musical instrument</span>
              </li>
              <li className="flex items-start gap-2">
                <Music2 className="w-6 h-6 text-blue-500" />
                <span>Identify which family it belongs to: Strings, Woodwinds, Brass, or Percussion</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn to recognize the unique sound of each instrument family!</span>
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
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
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
            Instrument Detective
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
            />
            <Volume2 size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[45px]">
              {gameState.volume}%
            </span>
          </div>
        </div>

        {/* Play Sound Button */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 w-full max-w-2xl`}>
          <div className="text-center mb-6">
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-4`}>
              Listen to the instrument and identify its family!
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              onClick={handlePlaySound}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : 'Play Instrument'}
            </Button>
          </div>

          {/* Answer Buttons */}
          {gameState.hasPlayed && !gameState.feedback && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(FAMILY_INFO).map(([family, info]) => (
                <Button
                  key={family}
                  onClick={() => handleAnswer(family as any)}
                  disabled={gameState.feedback !== null}
                  size="lg"
                  className={`bg-gradient-to-r ${info.color} hover:${info.hoverColor} text-white px-6 py-6 text-lg font-bold flex flex-col items-center gap-2`}
                >
                  <span className="text-3xl">{info.emoji}</span>
                  {info.name}
                </Button>
              ))}
            </div>
          )}

          {/* Feedback */}
          {gameState.feedback?.show && (
            <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
              gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <p className={playfulTypography.headings.h3}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct! That was {FAMILY_INFO[gameState.currentInstrument!.family].name} - {gameState.currentInstrument?.sound.name}!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    That was {FAMILY_INFO[gameState.currentInstrument!.family].name} - {gameState.currentInstrument?.sound.name}!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Instrument Families
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(FAMILY_INFO).map(([family, info]) => (
              <div key={family} className={`bg-gradient-to-br ${info.color} bg-opacity-10 p-4 rounded-lg`}>
                <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                  <span className="text-2xl">{info.emoji}</span>
                  {info.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Knowledge:</strong> Orchestral instruments are grouped into families based on how they produce sound.
              Strings vibrate strings, Woodwinds use air through reeds or openings, Brass use buzzing lips in a mouthpiece,
              and Percussion are struck or shaken to create sound.
            </p>
          </div>
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>🎵 Authentic Orchestra Sounds:</strong> This game uses real samples from the Philharmonia Orchestra,
              so you're hearing actual professional musicians playing these instruments! Listen carefully to the unique
              timbre (tone color) of each family - this helps you identify them in real orchestral music.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
