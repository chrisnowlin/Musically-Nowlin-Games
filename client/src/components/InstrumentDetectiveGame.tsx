import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Music2, Mic, ChevronLeft, RefreshCw} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { usePhilharmoniaInstruments } from "@/hooks/usePhilharmoniaInstruments";
import { instrumentLibrary } from "@/lib/instrumentLibrary";
import { PatternType, Difficulty } from "@/lib/melodyLibrary";

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  currentInstrument: {
    family: InstrumentFamily;
    instrument: GameInstrument;
    pattern: PatternType;
    patternDescription: string;
    notes: string[];
  } | null;
  hasPlayed: boolean;
  volume: number;
  difficulty: Difficulty;
}

type InstrumentFamily = "strings" | "woodwinds" | "brass" | "percussion";

interface GameInstrument {
  name: string;
  displayName: string;
  family: InstrumentFamily;
  philharmoniaName: string;
  availableNotes: string[];
  description: string;
}

// Volume normalization multipliers per instrument
// These values compensate for the natural loudness differences in the Philharmonia samples
// All values tripled for maximum audibility
const INSTRUMENT_VOLUME_NORMALIZATION: Record<string, number> = {
  // Strings - generally well balanced
  'violin': 9.0,
  'viola': 9.9,      // Slightly quieter samples
  'cello': 8.7,      // Slightly louder samples
  'double-bass': 11.4, // Much quieter samples
  
  // Woodwinds - varied loudness
  'flute': 7.8,      // Bright and penetrating
  'clarinet': 8.1,   // Slightly loud
  'oboe': 7.2,       // Very penetrating
  'bassoon': 9.9,    // Quieter low register
  'saxophone': 6.9,  // Very loud and projecting
  
  // Brass - naturally loud instruments
  'trumpet': 6.0,    // Very loud and bright
  'french-horn': 7.8, // Mellow but still loud
  'trombone': 6.3,   // Very powerful
  'tuba': 8.1,       // Deep but controlled
  
  // Percussion - varied dynamics
  'timpani': 12.0,   // Boosted for better audibility
  'xylophone': 7.2,  // Bright and cutting
  'glockenspiel': 5.4, // Very bright and piercing
};

// Get normalized volume for an instrument
// Web Audio API allows gain > 1.0 for amplification
const getNormalizedVolume = (instrumentName: string, baseVolume: number): number => {
  const normalizer = INSTRUMENT_VOLUME_NORMALIZATION[instrumentName] || 1.0;
  return baseVolume * normalizer;
};

// Build instruments dynamically from the instrument library
// This ensures we only use notes that actually have samples
const buildGameInstruments = (): GameInstrument[] => {
  const familyMap: Record<string, InstrumentFamily> = {
    'strings': 'strings',
    'woodwinds': 'woodwinds', 
    'brass': 'brass',
    'percussion': 'percussion',
  };

  const instruments: GameInstrument[] = [];
  const instrumentNames = [
    'violin', 'viola', 'cello', 'double-bass',
    'flute', 'clarinet', 'oboe', 'bassoon', 'saxophone',
    'trumpet', 'french-horn', 'trombone', 'tuba',
    'timpani', 'xylophone', 'glockenspiel'
  ];

  for (const name of instrumentNames) {
    const inst = instrumentLibrary.getInstrument(name);
    if (inst) {
      const samples = instrumentLibrary.getSamples(name);
      const availableNotes = samples.map(s => s.note);
      
      // Only include instruments that have at least 3 notes
      if (availableNotes.length >= 3) {
        instruments.push({
          name: inst.name,
          displayName: inst.displayName,
          family: familyMap[inst.family] || 'strings',
          philharmoniaName: inst.name,
          availableNotes: availableNotes,
          description: inst.description,
        });
      }
    }
  }

  return instruments;
};

const GAME_INSTRUMENTS = buildGameInstruments();

// Pattern generators that create melodies from available notes
const PATTERN_GENERATORS: {
  pattern: PatternType;
  description: string;
  difficulty: Difficulty;
  generate: (notes: string[]) => string[];
}[] = [
  // BEGINNER patterns - simple, short
  {
    pattern: "arpeggio",
    description: "Rising arpeggio",
    difficulty: "beginner",
    generate: (notes) => notes.slice(0, Math.min(3, notes.length)),
  },
  {
    pattern: "arpeggio",
    description: "Falling arpeggio", 
    difficulty: "beginner",
    generate: (notes) => notes.slice(0, Math.min(3, notes.length)).reverse(),
  },
  {
    pattern: "melody",
    description: "Simple up and down",
    difficulty: "beginner",
    generate: (notes) => {
      const subset = notes.slice(0, Math.min(3, notes.length));
      return [...subset, ...subset.slice().reverse().slice(1)];
    },
  },
  {
    pattern: "sustained",
    description: "Long held tones",
    difficulty: "beginner",
    generate: (notes) => notes.slice(0, Math.min(3, notes.length)),
  },
  {
    pattern: "rhythm",
    description: "Repeated notes",
    difficulty: "beginner",
    generate: (notes) => {
      const first = notes[0];
      const last = notes[notes.length - 1];
      return [first, first, last, last, first];
    },
  },

  // INTERMEDIATE patterns - longer, more varied
  {
    pattern: "arpeggio",
    description: "Rolling arpeggio",
    difficulty: "intermediate",
    generate: (notes) => {
      const subset = notes.slice(0, Math.min(4, notes.length));
      return [...subset, ...subset.slice().reverse()];
    },
  },
  {
    pattern: "melody",
    description: "Winding melody",
    difficulty: "intermediate",
    generate: (notes) => {
      if (notes.length < 3) return notes;
      return [notes[0], notes[1], notes[0], notes[2], notes[1], notes[0]];
    },
  },
  {
    pattern: "scale",
    description: "Scale passage",
    difficulty: "intermediate",
    generate: (notes) => {
      const sorted = [...notes].sort();
      return [...sorted, ...sorted.slice().reverse().slice(1)];
    },
  },
  {
    pattern: "fanfare",
    description: "Bold fanfare",
    difficulty: "intermediate",
    generate: (notes) => {
      const first = notes[0];
      const mid = notes[Math.floor(notes.length / 2)];
      const last = notes[notes.length - 1];
      return [first, first, mid, last, mid, first];
    },
  },
  {
    pattern: "rhythm",
    description: "Rhythmic pattern",
    difficulty: "intermediate",
    generate: (notes) => {
      if (notes.length < 2) return notes;
      const [a, b] = notes;
      return [a, b, a, b, a, b, a];
    },
  },

  // ADVANCED patterns - complex, longer
  {
    pattern: "melody",
    description: "Expressive melody",
    difficulty: "advanced",
    generate: (notes) => {
      if (notes.length < 4) return notes;
      return [
        notes[0], notes[1], notes[2], notes[1],
        notes[2], notes[3], notes[2], notes[1], notes[0]
      ];
    },
  },
  {
    pattern: "trill",
    description: "Ornamental flourish",
    difficulty: "advanced",
    generate: (notes) => {
      if (notes.length < 2) return notes;
      const [a, b] = notes;
      return [a, b, a, b, a, b, a, b, a];
    },
  },
  {
    pattern: "arpeggio",
    description: "Extended arpeggio",
    difficulty: "advanced",
    generate: (notes) => {
      const all = [...notes];
      return [...all, ...all.slice().reverse(), ...all];
    },
  },
  {
    pattern: "scale",
    description: "Full scale run",
    difficulty: "advanced",
    generate: (notes) => {
      const sorted = [...notes].sort();
      return [...sorted, ...sorted.slice().reverse()];
    },
  },
];

// Get all families represented
const INSTRUMENT_FAMILIES: { id: InstrumentFamily; name: string; instruments: string }[] = [
  { id: "strings", name: "Strings", instruments: "Violin, Viola, Cello, Double Bass" },
  { id: "woodwinds", name: "Woodwinds", instruments: "Flute, Clarinet, Oboe, Bassoon, Saxophone" },
  { id: "brass", name: "Brass", instruments: "Trumpet, French Horn, Trombone, Tuba" },
  { id: "percussion", name: "Percussion", instruments: "Timpani, Xylophone, Glockenspiel" },
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
    difficulty: "beginner",
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
    // Strings
    'violin', 'viola', 'cello', 'double-bass', 'guitar',
    // Woodwinds
    'flute', 'clarinet', 'oboe', 'bassoon', 'saxophone',
    // Brass
    'trumpet', 'french-horn', 'trombone', 'tuba',
    // Percussion
    'timpani', 'xylophone', 'glockenspiel'
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

  // Play a melody on a specific instrument
  const playInstrumentSound = useCallback(async (
    instrument: GameInstrument, 
    pattern: PatternType,
    notes: string[]
  ) => {
    if (gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayed: true }));

    // Apply volume normalization for this instrument
    const normalizedVolume = getNormalizedVolume(instrument.philharmoniaName, gameState.volume / 100);

    try {
      // Different playing patterns for musical variety
      switch (pattern) {
        case "melody":
        case "scale":
          // Flowing melodic line
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.4, {
            volume: normalizedVolume,
          });
          break;

        case "arpeggio":
          // Quick arpeggiated notes
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.3, {
            volume: normalizedVolume,
          });
          break;

        case "fanfare":
          // Bold, accented notes
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.5, {
            volume: normalizedVolume,
          });
          break;

        case "sustained":
          // Long held notes
          for (const note of notes) {
            await playPhilharmoniaNote(instrument.philharmoniaName, note, {
              volume: normalizedVolume,
              duration: 1.2,
            });
            await new Promise(resolve => setTimeout(resolve, 1300));
          }
          break;

        case "pizzicato":
          // Short, plucked notes
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.15, {
            volume: normalizedVolume,
          });
          break;

        case "rhythm":
          // Rhythmic pattern with varying note lengths
          const rhythmDurations = [0.3, 0.2, 0.4, 0.2, 0.3, 0.25, 0.35];
          for (let i = 0; i < notes.length; i++) {
            const duration = rhythmDurations[i % rhythmDurations.length];
            await playPhilharmoniaNote(instrument.philharmoniaName, notes[i], {
              volume: normalizedVolume,
              duration: duration,
            });
            await new Promise(resolve => setTimeout(resolve, (duration + 0.08) * 1000));
          }
          break;

        case "trill":
          // Rapid alternating notes
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.18, {
            volume: normalizedVolume,
          });
          break;

        default:
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.4, {
            volume: normalizedVolume,
          });
      }
    } catch (error) {
      console.error("Error playing Philharmonia sound:", error);
    }

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.volume, gameState.isPlaying, playPhilharmoniaMelody, playPhilharmoniaNote]);

  const generateNewInstrument = useCallback(() => {
    // Pick a random instrument
    const randomInstrument = GAME_INSTRUMENTS[Math.floor(Math.random() * GAME_INSTRUMENTS.length)];
    
    // Filter patterns by difficulty
    let availablePatterns = PATTERN_GENERATORS;
    if (gameState.difficulty === "beginner") {
      availablePatterns = PATTERN_GENERATORS.filter(p => p.difficulty === "beginner");
    } else if (gameState.difficulty === "intermediate") {
      availablePatterns = PATTERN_GENERATORS.filter(p => p.difficulty === "beginner" || p.difficulty === "intermediate");
    }
    
    // Pick a random pattern generator
    const patternGen = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    
    // Generate the notes using ONLY the available notes for this instrument
    const generatedNotes = patternGen.generate(randomInstrument.availableNotes);

    setGameState(prev => ({
      ...prev,
      currentInstrument: {
        family: randomInstrument.family,
        instrument: randomInstrument,
        pattern: patternGen.pattern,
        patternDescription: patternGen.description,
        notes: generatedNotes,
      },
      hasPlayed: false,
      feedback: null,
    }));
  }, [gameState.difficulty]);

  const handlePlaySound = useCallback(() => {
    if (gameState.currentInstrument) {
      playInstrumentSound(
        gameState.currentInstrument.instrument,
        gameState.currentInstrument.pattern,
        gameState.currentInstrument.notes
      );
    }
  }, [gameState.currentInstrument, playInstrumentSound]);

  const handleAnswer = useCallback((guessFamily: InstrumentFamily) => {
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
    }, 3000);
  }, [gameState.currentInstrument, gameState.hasPlayed, gameState.feedback, generateNewInstrument]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty }));
  };

  const decorativeOrbs = generateDecorativeOrbs();

  const FAMILY_INFO = {
    strings: {
      name: "Strings",
      emoji: "🎻",
      color: "from-amber-400 to-amber-500",
      hoverColor: "from-amber-500 to-amber-600",
      description: "Warm, singing tones from bowed or plucked strings",
      instruments: "Violin, Viola, Cello, Double Bass"
    },
    woodwinds: {
      name: "Woodwinds",
      emoji: "🎷",
      color: "from-green-400 to-green-500",
      hoverColor: "from-green-500 to-green-600",
      description: "Airy, expressive sounds from wind instruments",
      instruments: "Flute, Clarinet, Oboe, Bassoon, Saxophone"
    },
    brass: {
      name: "Brass",
      emoji: "🎺",
      color: "from-yellow-400 to-yellow-500",
      hoverColor: "from-yellow-500 to-yellow-600",
      description: "Bold, powerful tones from metal instruments",
      instruments: "Trumpet, French Horn, Trombone, Tuba"
    },
    percussion: {
      name: "Percussion",
      emoji: "🥁",
      color: "from-red-400 to-red-500",
      hoverColor: "from-red-500 to-red-600",
      description: "Rhythmic and melodic struck sounds",
      instruments: "Timpani, Xylophone, Glockenspiel"
    }
  };

  const DIFFICULTY_INFO = {
    beginner: { label: "Beginner", description: "Common instruments, simple patterns", color: "bg-green-500" },
    intermediate: { label: "Intermediate", description: "More instruments, varied patterns", color: "bg-yellow-500" },
    advanced: { label: "Advanced", description: "All instruments, complex phrases", color: "bg-red-500" },
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
              🔍 Instrument Detective
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Listen to real Philharmonia Orchestra instruments and identify their family!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Mic className="w-6 h-6 text-red-500 flex-shrink-0" />
                <span>Listen to melodies played by real orchestra musicians</span>
              </li>
              <li className="flex items-start gap-2">
                <Music2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <span>Identify which family: <strong>Strings</strong>, <strong>Woodwinds</strong>, <strong>Brass</strong>, or <strong>Percussion</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                <span>Learn to recognize 17+ different instruments!</span>
              </li>
            </ul>
          </div>

          {/* Difficulty Selection */}
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card}`}>
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Choose Difficulty</h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => handleDifficultyChange(key as any)}
                  className={`p-4 rounded-xl transition-all ${
                    gameState.difficulty === key
                      ? `${info.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="font-bold">{info.label}</div>
                  <div className="text-xs mt-1 opacity-80">{info.description}</div>
                </button>
              ))}
            </div>
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
              Start Detective Work!
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
        <div className="flex items-center justify-between w-full max-w-2xl mb-4">
          <ScoreDisplay score={gameState.score} total={gameState.totalQuestions} />
          <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${DIFFICULTY_INFO[gameState.difficulty].color}`}>
            {DIFFICULTY_INFO[gameState.difficulty].label}
          </div>
        </div>

        <div className="mb-6">
          <h2 className={`${playfulTypography.headings.h2} text-center text-gray-800 dark:text-gray-200`}>
            🔍 Instrument Detective
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
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 mb-2`}>
              Listen carefully and identify the instrument family!
            </p>
            {gameState.currentInstrument && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {gameState.currentInstrument.patternDescription}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={handlePlaySound}
              disabled={gameState.isPlaying || gameState.feedback !== null}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              <Play className="w-6 h-6 mr-2" />
              {gameState.isPlaying ? 'Playing...' : 'Play Sound'}
            </Button>
            {gameState.hasPlayed && !gameState.feedback && (
              <Button
                onClick={handlePlaySound}
                disabled={gameState.isPlaying}
                variant="outline"
                size="lg"
                className="transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Replay
              </Button>
            )}
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
                  className={`bg-gradient-to-r ${info.color} hover:${info.hoverColor} text-white px-6 py-6 text-lg font-bold flex flex-col items-center gap-2 transform hover:scale-105 transition-all`}
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
              <p className={`${playfulTypography.headings.h3} mb-2`}>
                {gameState.feedback.isCorrect ? (
                  <>
                    <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                    Correct!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  "Not quite!"
                )}
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                That was the <strong>{gameState.currentInstrument?.instrument.displayName}</strong> ({FAMILY_INFO[gameState.currentInstrument!.family].name})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {FAMILY_INFO[gameState.currentInstrument!.family].instruments}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            🎵 Instrument Families
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(FAMILY_INFO).map(([family, info]) => (
              <div key={family} className={`bg-gradient-to-br ${info.color} bg-opacity-10 p-4 rounded-lg`}>
                <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-2">
                  <span className="text-2xl">{info.emoji}</span>
                  {info.name}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  {info.description}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Instruments:</strong> {info.instruments}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>🎼 Pro Tip:</strong> Listen for the unique <em>timbre</em> (tone color) of each family!
              Strings have a warm, singing quality. Woodwinds are airy and expressive. Brass is bold and powerful.
              Percussion creates rhythmic and melodic struck sounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
