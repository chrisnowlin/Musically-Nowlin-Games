import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Star, Sparkles, Volume2, VolumeX, Check, RotateCcw, Plus, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

type RhythmBlockType = "quarter" | "eighth" | "half" | "rest";

interface RhythmBlock {
  id: string;
  type: RhythmBlockType;
  duration: number; // in seconds
  symbol: string;
  name: string;
  color: string;
}

interface GameState {
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  feedback: { show: boolean; isCorrect: boolean } | null;
  targetPattern: RhythmBlock[];
  playerPattern: RhythmBlock[];
  hasPlayedTarget: boolean;
  volume: number;
}

// Available rhythm blocks
const RHYTHM_BLOCKS: RhythmBlock[] = [
  { id: "quarter", type: "quarter", duration: 0.5, symbol: "♩", name: "Quarter", color: "bg-blue-500" },
  { id: "eighth", type: "eighth", duration: 0.25, symbol: "♪", name: "Eighth", color: "bg-green-500" },
  { id: "half", type: "half", duration: 1.0, symbol: "𝅗𝅥", name: "Half", color: "bg-purple-500" },
  { id: "rest", type: "rest", duration: 0.5, symbol: "𝄽", name: "Rest", color: "bg-gray-400" },
];

const NOTE_FREQUENCY = 440; // A4

export default function RhythmPuzzleBuilderGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    feedback: null,
    targetPattern: [],
    playerPattern: [],
    hasPlayedTarget: false,
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
    if (gameStarted && gameState.targetPattern.length === 0) {
      generateNewPattern();
    }
  }, [gameStarted]);

  const playNote = useCallback(async (duration: number) => {
    if (!audioContext.current) return;

    const masterVolume = gameState.volume / 100;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = NOTE_FREQUENCY;
    oscillator.type = "sine";

    const volume = 0.3 * masterVolume;
    const startTime = audioContext.current.currentTime;
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    await new Promise(resolve => setTimeout(resolve, duration * 1000));
  }, [gameState.volume]);

  const playPattern = useCallback(async (pattern: RhythmBlock[]) => {
    if (!audioContext.current) return;

    for (const block of pattern) {
      if (block.type === "rest") {
        // Rest - silence
        await new Promise(resolve => setTimeout(resolve, block.duration * 1000));
      } else {
        await playNote(block.duration);
      }
    }
  }, [playNote]);

  const generateNewPattern = useCallback(() => {
    // Create a rhythm pattern of 4-6 blocks
    const patternLength = Math.floor(Math.random() * 3) + 4; // 4-6 blocks
    const pattern: RhythmBlock[] = [];

    for (let i = 0; i < patternLength; i++) {
      const blockTemplate = RHYTHM_BLOCKS[Math.floor(Math.random() * RHYTHM_BLOCKS.length)];
      // Create a new block with unique ID
      pattern.push({
        ...blockTemplate,
        id: `${blockTemplate.id}-${i}-${Date.now()}`,
      });
    }

    setGameState(prev => ({
      ...prev,
      targetPattern: pattern,
      playerPattern: [],
      hasPlayedTarget: false,
      feedback: null,
    }));
  }, []);

  const handlePlayTarget = useCallback(async () => {
    if (gameState.isPlaying || gameState.feedback) return;

    setGameState(prev => ({ ...prev, isPlaying: true, hasPlayedTarget: true }));

    await playPattern(gameState.targetPattern);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.targetPattern, gameState.isPlaying, gameState.feedback, playPattern]);

  const handlePlayMyRhythm = useCallback(async () => {
    if (gameState.isPlaying || gameState.playerPattern.length === 0) return;

    setGameState(prev => ({ ...prev, isPlaying: true }));

    await playPattern(gameState.playerPattern);

    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, [gameState.playerPattern, gameState.isPlaying, playPattern]);

  const handleAddBlock = useCallback((blockType: RhythmBlockType) => {
    if (gameState.feedback) return;

    const blockTemplate = RHYTHM_BLOCKS.find(b => b.type === blockType);
    if (!blockTemplate) return;

    const newBlock: RhythmBlock = {
      ...blockTemplate,
      id: `${blockTemplate.id}-${Date.now()}`,
    };

    setGameState(prev => ({
      ...prev,
      playerPattern: [...prev.playerPattern, newBlock],
    }));
  }, [gameState.feedback]);

  const handleRemoveLastBlock = useCallback(() => {
    if (gameState.feedback) return;

    setGameState(prev => ({
      ...prev,
      playerPattern: prev.playerPattern.slice(0, -1),
    }));
  }, [gameState.feedback]);

  const handleClearPattern = useCallback(() => {
    if (gameState.feedback) return;

    setGameState(prev => ({
      ...prev,
      playerPattern: [],
    }));
  }, [gameState.feedback]);

  const handleCheckAnswer = useCallback(() => {
    if (!gameState.hasPlayedTarget || gameState.feedback || gameState.playerPattern.length === 0) return;

    // Check if patterns match
    const isCorrect =
      gameState.playerPattern.length === gameState.targetPattern.length &&
      gameState.playerPattern.every((block, index) =>
        block.type === gameState.targetPattern[index].type
      );

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
      generateNewPattern();
    }, 3000);
  }, [gameState.hasPlayedTarget, gameState.feedback, gameState.playerPattern, gameState.targetPattern, generateNewPattern]);

  const handleStartGame = async () => {
    await audioService.initialize();
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
              Rhythm Puzzle Builder
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Arrange the rhythm blocks to match!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <Play className="w-6 h-6 text-orange-500" />
                <span>Listen to the target rhythm pattern</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🧩</span>
                <span>Build the same rhythm using the note blocks</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Learn about rhythm notation and note values!</span>
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
            Rhythm Puzzle Builder
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
          {/* Target Pattern */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                🎯 Target Rhythm:
              </h3>
              <Button
                onClick={handlePlayTarget}
                disabled={gameState.isPlaying || gameState.feedback !== null}
                size="sm"
                className={`${playfulComponents.button.primary}`}
              >
                <Play className="w-4 h-4 mr-2" />
                Play Target
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap min-h-[60px] bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-300 dark:border-orange-700">
              {gameState.targetPattern.map((block) => (
                <div
                  key={block.id}
                  className={`${block.color} text-white px-4 py-2 rounded-lg flex flex-col items-center justify-center min-w-[60px] shadow-md`}
                >
                  <span className="text-3xl">{block.symbol}</span>
                  <span className="text-xs mt-1">{block.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Player Pattern */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                🎵 Your Rhythm:
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={handlePlayMyRhythm}
                  disabled={gameState.isPlaying || gameState.playerPattern.length === 0}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Mine
                </Button>
                <Button
                  onClick={handleClearPattern}
                  disabled={gameState.feedback !== null || gameState.playerPattern.length === 0}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap min-h-[60px] bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              {gameState.playerPattern.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">Click blocks below to build your rhythm...</p>
              ) : (
                gameState.playerPattern.map((block) => (
                  <div
                    key={block.id}
                    className={`${block.color} text-white px-4 py-2 rounded-lg flex flex-col items-center justify-center min-w-[60px] shadow-md`}
                  >
                    <span className="text-3xl">{block.symbol}</span>
                    <span className="text-xs mt-1">{block.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Block Palette */}
          {gameState.hasPlayedTarget && !gameState.feedback && (
            <div className="space-y-4">
              <h3 className="font-bold text-center text-gray-800 dark:text-gray-200">
                Click to add blocks:
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {RHYTHM_BLOCKS.map((block) => (
                  <Button
                    key={block.type}
                    onClick={() => handleAddBlock(block.type)}
                    className={`${block.color} hover:opacity-80 text-white px-4 py-6 flex flex-col items-center gap-2`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-4xl">{block.symbol}</span>
                    <span className="text-xs">{block.name}</span>
                  </Button>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleRemoveLastBlock}
                  disabled={gameState.playerPattern.length === 0}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Remove Last
                </Button>
                <Button
                  onClick={handleCheckAnswer}
                  disabled={gameState.playerPattern.length === 0}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Check className="w-6 h-6 mr-2" />
                  Check Answer
                </Button>
              </div>
            </div>
          )}

          {!gameState.hasPlayedTarget && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Click "Play Target" to hear the rhythm pattern you need to build!
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
                    Perfect! You matched the rhythm!
                    <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                  </>
                ) : (
                  <>
                    Not quite! Compare your pattern with the target and try again next time!
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Educational Guide */}
        <div className={`mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card} w-full max-w-2xl`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Rhythm Notation & Note Values
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2 text-center text-2xl">
                ♩
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                <strong>Quarter Note</strong><br />
                Gets 1 beat
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <p className="font-bold text-green-600 dark:text-green-400 mb-2 text-center text-2xl">
                ♪
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                <strong>Eighth Note</strong><br />
                Gets 1/2 beat
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="font-bold text-purple-600 dark:text-purple-400 mb-2 text-center text-2xl">
                𝅗𝅥
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                <strong>Half Note</strong><br />
                Gets 2 beats
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="font-bold text-gray-600 dark:text-gray-400 mb-2 text-center text-2xl">
                𝄽
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                <strong>Quarter Rest</strong><br />
                Silence for 1 beat
              </p>
            </div>
          </div>
          <div className="mt-4 bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Musical Concept:</strong> Rhythm notation tells musicians how long to hold each note.
              Different note shapes represent different durations. Two eighth notes (♪♪) equal one quarter note (♩).
              Two quarter notes equal one half note (𝅗𝅥). Learning to read and write rhythm is like learning
              the alphabet of music - it's essential for playing any instrument!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
