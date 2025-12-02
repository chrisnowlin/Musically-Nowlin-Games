import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {
  Play,
  HelpCircle,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
  Music2,
  Mic,
  ChevronLeft,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Settings,
  X
} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { usePhilharmoniaInstruments } from "@/hooks/usePhilharmoniaInstruments";
import { instrumentLibrary } from "@/lib/instrumentLibrary";
import { PatternType, Difficulty } from "@/lib/melodyLibrary";
import * as Dialog from "@radix-ui/react-dialog";

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
  streak: number;
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
    streak: 0,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const audioContext = useRef<AudioContext | null>(null);

  // Load all Philharmonia instruments used in the game
  const {
    isLoading: instrumentsLoading,
    loadingProgress,
    playMelody: playPhilharmoniaMelody,
    playNote: playPhilharmoniaNote,
  } = usePhilharmoniaInstruments([
    // Strings
    'violin', 'viola', 'cello', 'double-bass',
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
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.4, { volume: normalizedVolume });
          break;

        case "arpeggio":
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.3, { volume: normalizedVolume });
          break;

        case "fanfare":
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.5, { volume: normalizedVolume });
          break;

        case "sustained":
          for (const note of notes) {
            await playPhilharmoniaNote(instrument.philharmoniaName, note, { volume: normalizedVolume, duration: 1.2 });
            await new Promise(resolve => setTimeout(resolve, 1300));
          }
          break;

        case "pizzicato":
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.15, { volume: normalizedVolume });
          break;

        case "rhythm":
          const rhythmDurations = [0.3, 0.2, 0.4, 0.2, 0.3, 0.25, 0.35];
          for (let i = 0; i < notes.length; i++) {
            const duration = rhythmDurations[i % rhythmDurations.length];
            await playPhilharmoniaNote(instrument.philharmoniaName, notes[i], { volume: normalizedVolume, duration: duration });
            await new Promise(resolve => setTimeout(resolve, (duration + 0.08) * 1000));
          }
          break;

        case "trill":
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.18, { volume: normalizedVolume });
          break;

        default:
          await playPhilharmoniaMelody(instrument.philharmoniaName, notes, 0.4, { volume: normalizedVolume });
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
    const newStreak = isCorrect ? gameState.streak + 1 : 0;

    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1,
      feedback: { show: true, isCorrect },
      streak: newStreak
    }));

    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }
  }, [gameState.currentInstrument, gameState.hasPlayed, gameState.feedback, gameState.streak]);

  const handleNextQuestion = () => {
    generateNewInstrument();
  };

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
      textColor: "text-amber-600",
      description: "Warm, singing tones from bowed or plucked strings",
      instruments: "Violin, Viola, Cello, Double Bass"
    },
    woodwinds: {
      name: "Woodwinds",
      emoji: "🎷",
      color: "from-emerald-400 to-emerald-500",
      hoverColor: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      description: "Airy, expressive sounds from wind instruments",
      instruments: "Flute, Clarinet, Oboe, Bassoon, Saxophone"
    },
    brass: {
      name: "Brass",
      emoji: "🎺",
      color: "from-orange-400 to-orange-500",
      hoverColor: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      description: "Bold, powerful tones from metal instruments",
      instruments: "Trumpet, French Horn, Trombone, Tuba"
    },
    percussion: {
      name: "Percussion",
      emoji: "🥁",
      color: "from-rose-400 to-rose-500",
      hoverColor: "from-rose-500 to-rose-600",
      textColor: "text-rose-600",
      description: "Rhythmic and melodic struck sounds",
      instruments: "Timpani, Xylophone, Glockenspiel"
    }
  };

  const DIFFICULTY_INFO = {
    beginner: { label: "Beginner", description: "Common instruments, simple patterns", color: "bg-green-500", ring: "ring-green-500" },
    intermediate: { label: "Intermediate", description: "More instruments, varied patterns", color: "bg-yellow-500", ring: "ring-yellow-500" },
    advanced: { label: "Advanced", description: "All instruments, complex phrases", color: "bg-red-500", ring: "ring-red-500" },
  };

  // Start Screen
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

        <div className="text-center space-y-8 z-10 max-w-4xl w-full">
          <div className="space-y-4 animate-fade-in-down">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              🔍 Instrument Detective
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300 max-w-2xl mx-auto`}>
              Listen to real Philharmonia Orchestra instruments and identify their family!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center gap-3 text-lg mb-4">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                  <span className={`${playfulTypography.body.medium} font-bold`}>How to Play</span>
                </div>
                <ul className="text-left space-y-4 text-base">
                  <li className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="bg-red-100 p-2 rounded-full"><Mic className="w-5 h-5 text-red-500" /></div>
                    <span>Listen to melodies played by real orchestra musicians</span>
                  </li>
                  <li className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full"><Music2 className="w-5 h-5 text-blue-500" /></div>
                    <span>Identify the family: Strings, Woodwinds, Brass, or Percussion</span>
                  </li>
                  <li className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="bg-yellow-100 p-2 rounded-full"><Star className="w-5 h-5 text-yellow-500" /></div>
                    <span>Build your streak and become a Master Detective!</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} flex flex-col justify-center`}>
              <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-gray-200">Select Difficulty</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => handleDifficultyChange(key as any)}
                    className={`p-4 rounded-xl transition-all flex items-center justify-between group ${
                      gameState.difficulty === key
                        ? `${info.color} text-white shadow-lg scale-105`
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold text-lg">{info.label}</div>
                      <div className={`text-xs mt-1 ${gameState.difficulty === key ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                        {info.description}
                      </div>
                    </div>
                    {gameState.difficulty === key && <Star className="w-6 h-6 fill-current" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            {instrumentsLoading ? (
              <div className="space-y-4 max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center justify-center gap-2">
                    <Music2 className="animate-bounce text-purple-600" />
                    Tuning Instruments...
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 relative"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
                    {Math.round(loadingProgress)}% Ready
                  </p>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleStartGame}
                size="lg"
                className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} px-12 py-8 text-2xl shadow-xl`}
              >
                <Play className="w-10 h-10 mr-4 fill-current" />
                Start Detective Work
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      {/* Header Bar */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full mb-6 z-20">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
        >
          <ChevronLeft size={20} />
          Exit
        </button>

        <div className="flex items-center gap-4">
          <ScoreDisplay score={gameState.score} total={gameState.totalQuestions} />
          <div className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-md flex items-center gap-2 ${DIFFICULTY_INFO[gameState.difficulty].color}`}>
            <Star className="w-4 h-4 fill-current" />
            {DIFFICULTY_INFO[gameState.difficulty].label}
          </div>
          <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Streak: {gameState.streak}
          </div>
          <Dialog.Root open={showSettings} onOpenChange={setShowSettings}>
            <Dialog.Trigger asChild>
              <button className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300 transition-all">
                <Settings size={24} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl z-50 w-full max-w-md animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Settings</h3>
                  <Dialog.Close asChild>
                    <button className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                  </Dialog.Close>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Volume</label>
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                      <VolumeX size={20} className="text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={gameState.volume}
                        onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <Volume2 size={20} className="text-purple-600" />
                      <span className="text-sm font-bold w-8">{gameState.volume}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                        <button
                          key={key}
                          onClick={() => handleDifficultyChange(key as any)}
                          className={`p-2 rounded-lg text-sm font-bold transition-all ${
                            gameState.difficulty === key
                              ? `${info.color} text-white`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {info.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-6xl mx-auto w-full z-10 pb-8">
        
        {/* Left Panel: Audio Control & Info */}
        <div className="flex-1 flex flex-col gap-6">
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
            {/* Visualizer Background Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 z-0" />
            
            <div className="z-10 relative space-y-6 w-full max-w-md">
              <h2 className={`${playfulTypography.headings.h3} text-gray-800 dark:text-gray-100`}>
                Identify the Sound
              </h2>
              
              <div className="h-48 flex items-center justify-center">
                <Button
                  onClick={handlePlaySound}
                  disabled={gameState.isPlaying || gameState.feedback !== null}
                  className={`w-40 h-40 rounded-full shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-2 border-4 border-white dark:border-gray-700
                    ${gameState.isPlaying 
                      ? 'bg-purple-500 scale-110 ring-8 ring-purple-300/50 animate-pulse' 
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:scale-105 hover:rotate-3'}`}
                >
                  {gameState.isPlaying ? (
                    <>
                      <Volume2 className="w-12 h-12 text-white animate-bounce" />
                      <span className="text-white font-bold">Playing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-16 h-16 text-white ml-2 fill-current" />
                      <span className="text-white font-bold text-lg">Play</span>
                    </>
                  )}
                </Button>
              </div>

              {gameState.hasPlayed && !gameState.feedback && (
                <div className="flex justify-center">
                   <Button
                    onClick={handlePlaySound}
                    disabled={gameState.isPlaying}
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-purple-50 text-purple-700 border-purple-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Replay Sound
                  </Button>
                </div>
              )}

              {gameState.currentInstrument && (
                <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full inline-block text-sm text-purple-700 dark:text-purple-300 font-medium">
                  Hint: {gameState.currentInstrument.patternDescription}
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Field Guide */}
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${showGuide ? 'flex-1' : 'flex-none'}`}>
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-4 flex items-center justify-between font-bold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span>Detective's Field Guide</span>
              </div>
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${showGuide ? '-rotate-90' : 'rotate-0'}`} />
            </button>
            
            {showGuide && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-700 animate-slide-down">
                {Object.entries(FAMILY_INFO).map(([family, info]) => (
                  <div key={family} className={`bg-gradient-to-br ${info.color} bg-opacity-10 p-3 rounded-xl border border-white/50 shadow-sm`}>
                    <p className="font-bold text-white flex items-center gap-2 mb-1 drop-shadow-md">
                      <span className="text-xl">{info.emoji}</span>
                      {info.name}
                    </p>
                    <p className="text-xs text-white/90 font-medium drop-shadow-sm leading-tight">
                      {info.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Controls & Interaction */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Answer Area */}
          <div className={`flex-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} flex flex-col justify-center`}>
            
            {!gameState.hasPlayed ? (
              <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-300 ml-1" />
                </div>
                <p>Press the big Play button to hear the mystery instrument!</p>
              </div>
            ) : !gameState.feedback ? (
              <div className="grid grid-cols-2 gap-4 h-full">
                {Object.entries(FAMILY_INFO).map(([family, info]) => (
                  <button
                    key={family}
                    onClick={() => handleAnswer(family as any)}
                    className={`
                      relative overflow-hidden group
                      bg-gradient-to-br ${info.color}
                      hover:scale-[1.02] active:scale-[0.98]
                      transition-all duration-200
                      rounded-2xl shadow-lg hover:shadow-xl
                      p-4 flex flex-col items-center justify-center gap-3
                      border-2 border-white/20
                    `}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    <span className="text-5xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300 filter group-hover:drop-shadow-2xl">
                      {info.emoji}
                    </span>
                    <span className="text-white font-bold text-xl drop-shadow-md">
                      {info.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in space-y-6">
                <div className={`
                  w-24 h-24 rounded-full flex items-center justify-center shadow-inner mb-4
                  ${gameState.feedback.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                `}>
                  {gameState.feedback.isCorrect ? (
                    <Star className="w-12 h-12 fill-current animate-bounce-custom" />
                  ) : (
                    <span className="text-4xl">🤔</span>
                  )}
                </div>

                <div>
                  <h3 className={`text-3xl font-extrabold mb-2 ${gameState.feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {gameState.feedback.isCorrect ? "Brilliant!" : "Good Try!"}
                  </h3>
                  <p className="text-xl text-gray-700 dark:text-gray-300 max-w-sm mx-auto">
                    That was the <span className="font-bold text-purple-600">{gameState.currentInstrument?.instrument.displayName}</span>
                  </p>
                  <p className="text-gray-500 mt-2">
                    Part of the <span className="font-semibold">{FAMILY_INFO[gameState.currentInstrument!.family].name}</span> family
                  </p>
                </div>

                <div className="flex gap-4 w-full max-w-xs">
                   {!gameState.feedback.isCorrect && (
                      <Button 
                        onClick={handlePlaySound}
                        variant="outline"
                        className="flex-1"
                      >
                        Listen Again
                      </Button>
                   )}
                   <Button 
                    onClick={handleNextQuestion}
                    size="lg"
                    className={`${playfulComponents.button.primary} flex-1 shadow-lg hover:shadow-xl`}
                  >
                    Next Mystery <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
