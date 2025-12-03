import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  ChevronLeft, Volume2, VolumeX, Play, Trophy, Star, Music2, 
  Sparkles, ArrowRight, HelpCircle, X
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ResponsiveGameLayout, GameSection } from "@/components/ResponsiveGameLayout";
import { playfulTypography, playfulShapes, playfulColors, generateDecorativeOrbs } from "@/theme/playful";
import { audioService } from "../lib/audioService";

import {
  EXPRESSION_MODES,
  ARTICULATION_STYLES,
  getModeById,
  getMaxDifficultyForMode,
  GameMode
} from "../lib/gameLogic/dynamics-002Modes";
import {
  GameRound,
  GameProgress,
  generateRound,
  validateAnswer,
  calculateScore,
  updateProgress,
  getNextDifficulty,
  getScoreBreakdown,
  ScoreBreakdown,
  createInitialProgress
} from "../lib/gameLogic/dynamics-002Logic";

interface GameState {
  currentMode: GameMode | null;
  score: number;
  round: number;
  currentRound: GameRound | null;
  isAnswered: boolean;
  selectedAnswer: number | null;
  volume: number;
  isPlaying: boolean;
  startTime: number;
  gameProgress: Record<string, GameProgress>;
  showModeSelection: boolean;
  totalScore: number;
  scoreBreakdown: ScoreBreakdown | null;
  showHelp: boolean;
}

export const Dynamics002Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    currentMode: null,
    score: 0,
    round: 1,
    currentRound: null,
    isAnswered: false,
    selectedAnswer: null,
    volume: 50,
    isPlaying: false,
    startTime: Date.now(),
    gameProgress: {},
    showModeSelection: true,
    totalScore: 0,
    scoreBreakdown: null,
    showHelp: false
  });

  const decorativeOrbs = useMemo(() => generateDecorativeOrbs(), []);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('dynamics-002-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(prev => ({
          ...prev,
          gameProgress: parsed.gameProgress || {},
          totalScore: parsed.totalScore || 0
        }));
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, []);

  // Save progress
  const saveProgress = useCallback(() => {
    localStorage.setItem('dynamics-002-progress', JSON.stringify({
      gameProgress: gameState.gameProgress,
      totalScore: gameState.totalScore
    }));
  }, [gameState.gameProgress, gameState.totalScore]);

  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  // Audio playback functions
  const playTone = useCallback((
    frequency: number, 
    duration: number, 
    volume: number, 
    articulation: string,
    startOffset: number = 0
  ) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const masterVolume = gameState.volume / 100;
    const actualVolume = volume * masterVolume * 0.4;
    const now = ctx.currentTime + startOffset;

    const style = ARTICULATION_STYLES[articulation as keyof typeof ARTICULATION_STYLES];
    
    if (articulation === 'staccato') {
      const shortDuration = duration * 0.3;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + shortDuration);
      oscillator.start(now);
      oscillator.stop(now + shortDuration);
    } else if (articulation === 'legato') {
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume, now + 0.08);
      gainNode.gain.setValueAtTime(actualVolume, now + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
      oscillator.start(now);
      oscillator.stop(now + duration);
    } else if (articulation === 'accent') {
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume * 1.5, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(actualVolume, now + 0.1);
      gainNode.gain.setValueAtTime(actualVolume, now + duration - 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.start(now);
      oscillator.stop(now + duration);
    } else if (articulation === 'tenuto') {
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume * 1.1, now + 0.05);
      gainNode.gain.setValueAtTime(actualVolume * 1.1, now + duration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
      oscillator.start(now);
      oscillator.stop(now + duration);
    } else {
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume, now + 0.02);
      gainNode.gain.setValueAtTime(actualVolume, now + duration - 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.start(now);
      oscillator.stop(now + duration);
    }
  }, [gameState.volume]);

  const playPhrase = useCallback((round: GameRound) => {
    if (!round.audioConfig.phrase || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true }));

    const notes = round.audioConfig.phrase;
    const articulation = round.audioConfig.phrasing || 'legato';
    const style = ARTICULATION_STYLES[articulation as keyof typeof ARTICULATION_STYLES];
    
    const noteSpacing = style?.noteSpacing || 0.5;
    const noteDuration = style?.noteDuration || 0.5;

    notes.forEach((freq, index) => {
      playTone(freq, noteDuration, 0.8, articulation, index * noteSpacing);
    });

    const totalDuration = notes.length * noteSpacing * 1000 + 500;
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }, totalDuration);
  }, [gameState.isPlaying, playTone]);

  // Mode selection
  const selectMode = useCallback((mode: GameMode) => {
    const difficulty = gameState.gameProgress[mode.id]?.currentDifficulty || 1;
    const newRound = generateRound(mode.id, difficulty);

    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      showModeSelection: false,
      round: 1,
      score: 0,
      currentRound: newRound,
      isAnswered: false,
      selectedAnswer: null,
      startTime: Date.now(),
      scoreBreakdown: null
    }));
  }, [gameState.gameProgress]);

  // Answer selection
  const selectAnswer = useCallback((answerIndex: number) => {
    if (gameState.isAnswered || !gameState.currentRound) return;

    const timeSpent = Date.now() - gameState.startTime;
    const isCorrect = validateAnswer(answerIndex, gameState.currentRound.correctAnswer);
    const scoreBreakdown = getScoreBreakdown(isCorrect, timeSpent, gameState.currentRound.difficulty);

    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    setGameState(prev => {
      const newProgress = { ...prev.gameProgress };
      const modeId = prev.currentMode!.id;

      if (!newProgress[modeId]) {
        newProgress[modeId] = createInitialProgress(modeId);
      }

      const updatedProgress = updateProgress(newProgress[modeId], {
        correct: isCorrect,
        timeSpent,
        score: scoreBreakdown.total
      });

      const maxDiff = getMaxDifficultyForMode(modeId);
      updatedProgress.currentDifficulty = getNextDifficulty(
        updatedProgress.currentDifficulty,
        updatedProgress,
        maxDiff
      );

      newProgress[modeId] = updatedProgress;

      return {
        ...prev,
        selectedAnswer: answerIndex,
        isAnswered: true,
        score: prev.score + scoreBreakdown.total,
        totalScore: prev.totalScore + scoreBreakdown.total,
        gameProgress: newProgress,
        scoreBreakdown
      };
    });
  }, [gameState.isAnswered, gameState.currentRound, gameState.startTime]);

  // Next round
  const nextRound = useCallback(() => {
    if (!gameState.currentMode) return;

    const modeConfig = getModeById(gameState.currentMode.id);
    if (!modeConfig) return;

    if (gameState.round >= modeConfig.maxRounds) {
      setGameState(prev => ({
        ...prev,
        showModeSelection: true,
        currentMode: null,
        round: 1,
        score: 0,
        currentRound: null,
        isAnswered: false,
        selectedAnswer: null,
        scoreBreakdown: null
      }));
    } else {
      const difficulty = gameState.gameProgress[gameState.currentMode.id]?.currentDifficulty || 1;
      const newRound = generateRound(gameState.currentMode.id, difficulty);

      setGameState(prev => ({
        ...prev,
        round: prev.round + 1,
        currentRound: newRound,
        isAnswered: false,
        selectedAnswer: null,
        startTime: Date.now(),
        scoreBreakdown: null
      }));
    }
  }, [gameState.currentMode, gameState.round, gameState.gameProgress]);

  // Back to mode selection
  const backToModeSelection = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showModeSelection: true,
      currentMode: null,
      round: 1,
      score: 0,
      currentRound: null,
      isAnswered: false,
      selectedAnswer: null
    }));
  }, []);

  // --- Mode Selection Screen ---
  if (gameState.showModeSelection) {
    return (
      <ResponsiveGameLayout showDecorations={false}>
        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <GameSection variant="header">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center justify-between w-full max-w-4xl">
              <Button
                onClick={() => setLocation('/games')}
                variant="outline"
                className={`${playfulShapes.rounded.button} gap-2 border-2 border-red-300 text-red-700 hover:bg-red-50`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Games
              </Button>

              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-red-200 shadow-sm">
                {gameState.volume > 0 ? (
                  <Volume2 className="w-5 h-5 text-red-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameState.volume}
                  onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                  className="w-24 accent-red-500"
                  aria-label="Volume control"
                />
              </div>
            </div>

            <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <h1 className={`${playfulTypography.headings.hero} bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent`}>
                🎭 Expression Master
              </h1>
              <p className={`${playfulTypography.body.large} text-gray-600`}>
                Master musical articulation and expressive phrasing!
              </p>
            </div>

            {gameState.totalScore > 0 && (
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold shadow-sm border border-yellow-200">
                <Trophy className="w-5 h-5" />
                Total Score: {gameState.totalScore}
              </div>
            )}
          </div>
        </GameSection>

        <GameSection variant="main">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full px-4">
            {EXPRESSION_MODES.map((mode, index) => {
              const progress = gameState.gameProgress[mode.id];
              const completion = progress 
                ? (progress.correctAnswers / Math.max(progress.totalAnswers, 1)) * 100 
                : 0;

              return (
                <button
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                  className={`
                    relative group text-left
                    ${playfulShapes.rounded.card}
                    bg-white
                    border-4 border-transparent hover:border-red-300
                    shadow-xl hover:shadow-2xl
                    transform hover:-translate-y-2 hover:rotate-1
                    transition-all duration-300
                    p-8 flex flex-col gap-4
                    overflow-hidden
                  `}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Decorative gradient background */}
                  <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-50 ${
                    mode.id === 'articulation' ? 'bg-red-400' : 'bg-purple-400'
                  }`} />

                  <div className="relative z-10">
                    <div className="text-5xl mb-3 transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 origin-left">
                      {mode.icon}
                    </div>

                    <h3 className={`${playfulTypography.headings.h3} text-gray-800 group-hover:text-red-600 transition-colors`}>
                      {mode.name}
                    </h3>

                    <p className="text-gray-500 mt-2 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>

                  <div className="mt-auto space-y-4 relative z-10">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {mode.ageRange}
                      </span>
                      <span className={`px-3 py-1 rounded-full ${
                        mode.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        mode.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {mode.difficulty}
                      </span>
                    </div>

                    {progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold text-gray-500">
                          <span>Mastery</span>
                          <span className="text-red-600">{Math.round(completion)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              completion >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                              completion >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              'bg-gradient-to-r from-red-400 to-pink-500'
                            }`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                          <Trophy className="w-3 h-3" />
                          Best: {progress.bestScore} pts
                        </div>
                      </div>
                    )}

                    {!progress && (
                      <div className="text-center py-2 text-sm text-gray-400 font-medium">
                        ✨ Start your journey!
                      </div>
                    )}
                  </div>

                  {/* Play arrow indicator */}
                  <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-red-600" />
                  </div>
                </button>
              );
            })}
          </div>
        </GameSection>

        {/* Help Section */}
        <GameSection variant="footer">
          <div className="max-w-4xl mx-auto w-full px-4">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-6 border-2 border-red-100 shadow-lg">
              <h3 className={`${playfulTypography.headings.h4} text-red-800 flex items-center gap-2 mb-4`}>
                <HelpCircle className="w-5 h-5" />
                Articulation Guide
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(ARTICULATION_STYLES).map(([key, style]) => (
                  <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-mono text-red-500">{style.symbol}</span>
                      <span className="font-bold text-gray-800">{style.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{style.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GameSection>
      </ResponsiveGameLayout>
    );
  }

  // --- Active Game Screen ---
  if (!gameState.currentMode || !gameState.currentRound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-red-50 to-pink-50">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-lg text-red-600">Loading...</p>
      </div>
    );
  }

  const currentMode = gameState.currentMode;
  const currentRound = gameState.currentRound;

  return (
    <ResponsiveGameLayout showDecorations={true}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <GameSection variant="header">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 px-4">
          {/* Top Bar */}
          <div className="flex flex-col gap-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-red-100">
            <div className="flex items-center justify-between">
              <Button
                onClick={backToModeSelection}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-red-50 hover:text-red-700 gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Modes
              </Button>

              <div className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-pink-100 px-4 py-2 rounded-full border border-red-200">
                <span className="text-2xl">{currentMode.icon}</span>
                <span className="font-bold text-red-800">{currentMode.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {gameState.volume > 0 ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameState.volume}
                  onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                  className="w-20 accent-red-500"
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                  <span>Round {gameState.round} of {currentMode.maxRounds}</span>
                  <span className="text-red-600">{Math.round((gameState.round / currentMode.maxRounds) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(gameState.round / currentMode.maxRounds) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-yellow-100 text-yellow-800 px-5 py-2 rounded-full font-bold border border-yellow-200 shadow-sm whitespace-nowrap">
                <Trophy className="w-4 h-4 inline mr-1" />
                {gameState.score}
              </div>
            </div>
          </div>
        </div>
      </GameSection>

      <GameSection variant="main" fillSpace>
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-full gap-8 py-4 px-4">
          
          {/* Question */}
          <div className="text-center w-full">
            <h3 className={`${playfulTypography.headings.h2} text-gray-800 mb-6`}>
              {currentRound.question}
            </h3>

            {/* Play Button */}
            <div className="flex justify-center mb-8">
              <Button
                onClick={() => playPhrase(currentRound)}
                disabled={gameState.isPlaying}
                className={`
                  relative
                  w-36 h-36 rounded-full
                  flex flex-col items-center justify-center gap-3
                  transition-all duration-300
                  ${gameState.isPlaying
                    ? 'bg-gray-100 text-gray-400 scale-95 ring-4 ring-gray-200'
                    : 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 text-white shadow-2xl hover:shadow-3xl hover:scale-110 ring-4 ring-red-200 hover:ring-pink-300'
                  }
                `}
              >
                {gameState.isPlaying ? (
                  <>
                    <span className="absolute inset-0 rounded-full animate-ping bg-pink-400 opacity-20" />
                    <Music2 className="w-12 h-12 animate-bounce" />
                    <span className="text-sm font-bold">Playing...</span>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity" />
                    <Play className="w-14 h-14 fill-current ml-1" />
                    <span className="text-sm font-bold">Listen</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {currentRound.options.map((option, index) => {
              const isCorrect = index === currentRound.correctAnswer;
              const isSelected = index === gameState.selectedAnswer;
              const showResult = gameState.isAnswered;

              let cardStyle = "bg-white border-gray-200 hover:border-red-400 hover:bg-red-50 shadow-md hover:shadow-lg";
              let iconElement = <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex-shrink-0" />;

              if (showResult) {
                if (isCorrect) {
                  cardStyle = "bg-green-50 border-green-500 ring-2 ring-green-200 shadow-lg";
                  iconElement = (
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  );
                } else if (isSelected) {
                  cardStyle = "bg-red-50 border-red-500 ring-2 ring-red-200 shadow-lg";
                  iconElement = (
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <X className="w-4 h-4 text-white" />
                    </div>
                  );
                } else {
                  cardStyle = "bg-gray-50 border-gray-200 opacity-50";
                }
              } else if (isSelected) {
                cardStyle = "bg-red-50 border-red-500 ring-2 ring-red-200";
                iconElement = <div className="w-7 h-7 rounded-full border-4 border-red-500 flex-shrink-0" />;
              }

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={gameState.isAnswered}
                  className={`
                    p-5 rounded-2xl border-2 text-left transition-all duration-200
                    flex items-center justify-between gap-4
                    group
                    ${cardStyle}
                    ${gameState.isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}
                  `}
                >
                  <span className={`text-base font-semibold ${showResult && isCorrect ? 'text-green-800' : 'text-gray-700'} group-hover:text-red-800`}>
                    {option}
                  </span>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Result Feedback */}
          {gameState.isAnswered && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className={`
                rounded-3xl p-8 text-center shadow-xl border-2
                ${gameState.selectedAnswer === currentRound.correctAnswer
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                }
              `}>
                <div className="mb-6">
                  {gameState.selectedAnswer === currentRound.correctAnswer ? (
                    <h3 className="text-3xl font-bold text-green-700 mb-3 flex items-center justify-center gap-3">
                      <Sparkles className="w-8 h-8" /> Excellent!
                    </h3>
                  ) : (
                    <h3 className="text-3xl font-bold text-red-700 mb-3">
                      Not quite!
                    </h3>
                  )}

                  {currentRound.explanation && (
                    <p className="text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
                      {currentRound.explanation}
                    </p>
                  )}
                </div>

                {gameState.scoreBreakdown && gameState.scoreBreakdown.total > 0 && (
                  <div className="mb-6 bg-white/70 rounded-2xl p-5 max-w-sm mx-auto shadow-sm">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-left text-gray-600">Base Score:</div>
                      <div className="text-right font-bold">{gameState.scoreBreakdown.baseScore}</div>

                      <div className="text-left text-gray-600">Difficulty Bonus:</div>
                      <div className="text-right font-bold text-red-600">×{gameState.scoreBreakdown.difficultyMultiplier}</div>

                      <div className="col-span-2 border-t border-gray-200 my-2" />

                      <div className="text-left font-bold text-gray-800 text-lg">Total:</div>
                      <div className="text-right font-bold text-2xl text-green-600">+{gameState.scoreBreakdown.total}</div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={nextRound}
                  size="lg"
                  className={`
                    ${playfulShapes.rounded.button}
                    bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600
                    text-white shadow-lg hover:shadow-xl
                    px-10 text-lg font-bold
                  `}
                >
                  {gameState.round >= currentMode.maxRounds ? (
                    <>Complete Mode <Trophy className="w-5 h-5 ml-2" /></>
                  ) : (
                    <>Next Round <ArrowRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </GameSection>
    </ResponsiveGameLayout>
  );
};

export default Dynamics002Game;
