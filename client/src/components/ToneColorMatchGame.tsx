import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { usePhilharmoniaInstruments } from "@/hooks/usePhilharmoniaInstruments";

type InstrumentType = "flute" | "violin" | "trumpet" | "clarinet" | "cello" | "oboe" | "french-horn";

interface Instrument {
  type: InstrumentType;
  name: string;
  emoji: string;
  oscillatorType: OscillatorType;
  color: string;
  philharmoniaName: string; // Name used in Philharmonia library
  family: string; // Instrument family for educational purposes
}

interface Melody {
  notes: string[]; // note names (e.g., "C5", "D5")
  name: string;
}

interface GameOption {
  instrument: Instrument;
  melody: Melody;
  isCorrect: boolean; // Has the target melody
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  targetInstrument: Instrument | null;
  targetMelody: Melody | null;
  options: GameOption[];
  hasPlayedTarget: boolean;
  volume: number;
  playingOptionIndex: number | null;
}

// Instruments with different timbres - now using Philharmonia Orchestra samples
// 7 instruments across 3 families (percussion temporarily disabled due to missing samples)
const INSTRUMENTS: Instrument[] = [
  // Woodwinds - airy, bright
  { type: "flute", name: "Flute", emoji: "🦋", oscillatorType: "sine", color: "from-sky-400 to-sky-500", philharmoniaName: "flute", family: "Woodwinds" },
  { type: "clarinet", name: "Clarinet", emoji: "🐱", oscillatorType: "triangle", color: "from-green-400 to-green-500", philharmoniaName: "clarinet", family: "Woodwinds" },
  { type: "oboe", name: "Oboe", emoji: "🦆", oscillatorType: "sine", color: "from-teal-400 to-teal-500", philharmoniaName: "oboe", family: "Woodwinds" },

  // Strings - warm, singing
  { type: "violin", name: "Violin", emoji: "🐦", oscillatorType: "sawtooth", color: "from-amber-400 to-amber-500", philharmoniaName: "violin", family: "Strings" },
  { type: "cello", name: "Cello", emoji: "🐻", oscillatorType: "sawtooth", color: "from-orange-400 to-orange-500", philharmoniaName: "cello", family: "Strings" },

  // Brass - bold, powerful
  { type: "trumpet", name: "Trumpet", emoji: "🐓", oscillatorType: "square", color: "from-rose-400 to-rose-500", philharmoniaName: "trumpet", family: "Brass" },
  { type: "french-horn", name: "French Horn", emoji: "🦌", oscillatorType: "square", color: "from-yellow-400 to-yellow-500", philharmoniaName: "french-horn", family: "Brass" },

  // Note: Percussion instruments temporarily removed until sample files are properly organized
  // { type: "xylophone", name: "Xylophone", emoji: "🦜", oscillatorType: "triangle", color: "from-purple-400 to-purple-500", philharmoniaName: "xylophone", family: "Percussion" },
];

// Simple melodies using notes available across instruments in Philharmonia library
// Notes chosen to work across multiple octave ranges
const MELODIES: Melody[] = [
  // High register melodies (work for Flute, Violin, Xylophone)
  { notes: ["C5", "D5", "E5", "G5"], name: "Rising Scale" },
  { notes: ["G5", "E5", "D5", "C5"], name: "Falling Pattern" },
  { notes: ["C5", "E5", "C5", "E5"], name: "Bouncing Notes" },
  { notes: ["E5", "G5", "E5", "C5"], name: "Jumping Melody" },

  // Mid register melodies (work for Clarinet, Trumpet, Oboe, Violin)
  { notes: ["C4", "E4", "G4", "E4"], name: "Chord Arpeggio" },
  { notes: ["G4", "E4", "C4"], name: "Descending Triad" },
  { notes: ["E4", "G4", "E4", "C4"], name: "Rocking Pattern" },

  // Low register melodies (work for Cello, French Horn)
  { notes: ["C3", "E3", "G3", "E3"], name: "Low Harmony" },
  { notes: ["G3", "C3", "E3", "C3"], name: "Bass Line" },
];

export default function ToneColorMatchGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    targetInstrument: null,
    targetMelody: null,
    options: [],
    hasPlayedTarget: false,
    volume: 50,
    playingOptionIndex: null,
  });

  const [gameStarted, setGameStarted] = useState(false);

  // Memoize instrument names to prevent re-renders from recreating the array
  const instrumentNames = useMemo(() =>
    ['flute', 'clarinet', 'oboe', 'violin', 'cello', 'trumpet', 'french-horn'],
    []
  );

  // Initialize Philharmonia instruments - 7 instruments across 3 families
  const {
    isLoading: instrumentsLoading,
    loadingProgress,
    playMelody: playPhilharmoniaMelody,
    isInstrumentLoaded,
  } = usePhilharmoniaInstruments(instrumentNames);

  useEffect(() => {
    if (gameStarted && !gameState.targetMelody) {
      generateNewQuestion();
    }
  }, [gameStarted]);

  const playMelody = useCallback(async (melody: Melody, instrument: Instrument) => {
    const masterVolume = gameState.volume / 100;
    const noteDuration = 0.45; // slightly longer for real instruments

    // Play melody using Philharmonia samples
    await playPhilharmoniaMelody(
      instrument.philharmoniaName,
      melody.notes,
      noteDuration,
      { volume: masterVolume }
    );
  }, [gameState.volume, playPhilharmoniaMelody]);

  const generateNewQuestion = useCallback(() => {
    // Helper function to determine instrument register
    const getInstrumentRegister = (instrument: Instrument): 'high' | 'mid' | 'low' => {
      if (['flute', 'violin', 'xylophone'].includes(instrument.type)) return 'high';
      if (['clarinet', 'trumpet', 'oboe'].includes(instrument.type)) return 'mid';
      return 'low'; // cello, french-horn
    };

    // Helper function to get melodies for a register
    const getMelodiesForRegister = (register: 'high' | 'mid' | 'low'): Melody[] => {
      if (register === 'high') return MELODIES.slice(0, 4); // High register melodies
      if (register === 'mid') return MELODIES.slice(4, 7);  // Mid register melodies
      return MELODIES.slice(7, 9); // Low register melodies
    };

    // Pick target instrument
    const targetInstrument = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
    const targetRegister = getInstrumentRegister(targetInstrument);

    // Pick melody that matches the instrument's register
    const suitableMelodies = getMelodiesForRegister(targetRegister);
    const targetMelody = suitableMelodies[Math.floor(Math.random() * suitableMelodies.length)];

    // Get instruments in the same register for the correct answer
    const sameRegisterInstruments = INSTRUMENTS.filter(i =>
      i.type !== targetInstrument.type && getInstrumentRegister(i) === targetRegister
    );

    // If no same-register instruments available, use any other instrument
    const otherInstruments = sameRegisterInstruments.length > 0
      ? sameRegisterInstruments
      : INSTRUMENTS.filter(i => i.type !== targetInstrument.type);

    // Correct option: same melody, different instrument (same register if possible)
    const correctInstrument = otherInstruments[Math.floor(Math.random() * otherInstruments.length)];
    const correctOption: GameOption = {
      instrument: correctInstrument,
      melody: targetMelody,
      isCorrect: true,
    };

    // Wrong options: different melodies from the same register
    const wrongOptions: GameOption[] = [];
    const otherMelodies = suitableMelodies.filter(m => m.name !== targetMelody.name);

    for (let i = 0; i < 3; i++) {
      // Pick instruments from the same register for consistency
      const randomInstrument = INSTRUMENTS.filter(inst =>
        getInstrumentRegister(inst) === targetRegister
      )[Math.floor(Math.random() * INSTRUMENTS.filter(inst => getInstrumentRegister(inst) === targetRegister).length)];

      const randomMelody = otherMelodies[Math.floor(Math.random() * otherMelodies.length)];
      wrongOptions.push({
        instrument: randomInstrument,
        melody: randomMelody,
        isCorrect: false,
      });
    }

    // Shuffle all options
    const allOptions = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5);

    setGameState(prev => ({
      ...prev,
      targetInstrument,
      targetMelody,
      options: allOptions,
      hasPlayedTarget: false,
      feedback: null,
      playingOptionIndex: null,
    }));
  }, []);

  const handlePlayTarget = useCallback(async () => {
    if (!gameState.targetInstrument || !gameState.targetMelody || gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayedTarget: true }));

    await playMelody(gameState.targetMelody, gameState.targetInstrument);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.targetInstrument, gameState.targetMelody, gameState.isPlaying, gameState.feedback, playMelody]);

  const handlePlayOption = useCallback(async (optionIndex: number) => {
    if (!gameState.hasPlayedTarget || gameState.isPlaying || gameState.feedback) return;

    const option = gameState.options[optionIndex];

    setGameState(prev => ({ ...prev, isPlaying: true, playingOptionIndex: optionIndex }));

    await playMelody(option.melody, option.instrument);

    setGameState(prev => ({ ...prev, isPlaying: false, playingOptionIndex: null }));
  }, [gameState.hasPlayedTarget, gameState.isPlaying, gameState.feedback, gameState.options, playMelody]);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (!gameState.hasPlayedTarget || gameState.feedback) return;

    const selectedOption = gameState.options[optionIndex];
    const isCorrect = selectedOption.isCorrect;

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
  }, [gameState.hasPlayedTarget, gameState.feedback, gameState.options, generateNewQuestion]);

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
              Tone Color Match
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Match the same melody on different instruments!
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
              Featuring 8 real orchestral instruments across 4 families
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-pink-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Play className="w-6 h-6 text-pink-500" />
                <span>Listen to a melody played on a real orchestral instrument</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎨</span>
                <span>Find the same melody played on a different instrument</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about timbre and tone color with authentic sounds!</span>
              </li>
            </ul>
          </div>

          {instrumentsLoading && (
            <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card}`}>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Loading instruments...
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {Math.round(loadingProgress)}%
              </p>
            </div>
          )}

          <Button
            onClick={handleStartGame}
            size="lg"
            disabled={instrumentsLoading}
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            {instrumentsLoading ? 'Loading...' : 'Start Playing!'}
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
            Tone Color Match
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
          {/* Target Melody */}
          {gameState.targetInstrument && gameState.targetMelody && (
            <div className="space-y-4">
              <h3 className="font-bold text-center text-lg text-gray-800 dark:text-gray-200">
                🎯 Original Melody:
              </h3>
              <div className="flex justify-center items-center gap-4 p-6 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg">
                <span className="text-6xl">{gameState.targetInstrument.emoji}</span>
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {gameState.targetInstrument.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {gameState.targetMelody.name}
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handlePlayTarget}
                  disabled={gameState.isPlaying || gameState.feedback !== null}
                  size="lg"
                  className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
                >
                  <Play className="w-6 h-6 mr-2" />
                  {gameState.hasPlayedTarget ? 'Play Again' : 'Play Original'}
                </Button>
              </div>
            </div>
          )}

          {/* Options */}
          {gameState.hasPlayedTarget && !gameState.feedback && (
            <div className="space-y-4">
              <h3 className="font-bold text-center text-lg text-gray-800 dark:text-gray-200">
                Which one has the SAME melody?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {gameState.options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <Button
                      onClick={() => handlePlayOption(index)}
                      disabled={gameState.isPlaying}
                      className={`w-full bg-gradient-to-r ${option.instrument.color} hover:opacity-80 text-white px-6 py-6 text-lg font-bold flex flex-col items-center gap-2 ${
                        gameState.playingOptionIndex === index ? 'animate-pulse' : ''
                      }`}
                    >
                      <span className="text-4xl">{option.instrument.emoji}</span>
                      <span>Listen</span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(index)}
                      disabled={gameState.isPlaying}
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white"
                    >
                      Choose This One
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!gameState.hasPlayedTarget && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click "Play Original" to hear the target melody first!
            </p>
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
                    Correct! Same melody, different tone color!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    Not quite! Listen carefully to the melody pattern, not the instrument sound.
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Timbre & Tone Color
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
              <p className="font-bold text-pink-600 dark:text-pink-400 mb-2">
                What is Timbre?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Timbre</strong> (pronounced "TAM-ber") is the unique quality or "color" of a sound.
                It's what makes a flute sound different from a trumpet, even when playing the same note!
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">
                Melody vs. Timbre
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                The <strong>melody</strong> is the pattern of notes (high-low-high-low).
                The <strong>timbre</strong> is the instrument's sound quality.
                Same melody can have different tone colors!
              </p>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              <strong>Musical Concept:</strong> Timbre comes from the way different instruments produce sound.
              Learning to identify melodies regardless of timbre is an important listening skill!
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>Woodwinds:</strong> Air through reeds/openings</div>
              <div><strong>Strings:</strong> Bowed or plucked strings</div>
              <div><strong>Brass:</strong> Buzzing lips in mouthpiece</div>
              <div><strong>Percussion:</strong> Struck or shaken</div>
            </div>
          </div>
          <div className="mt-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Authentic Sounds:</strong> This game features <strong>8 instruments across 4 families</strong> with
              real recordings from the <strong>Philharmonia Orchestra</strong>. You're hearing actual professional musicians,
              which helps you develop an ear for authentic orchestral timbres!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
