import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, Volume2, VolumeX, Play, Trophy, Target, Clock, Star, Music2, Sparkles, Lock, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ResponsiveGameLayout, GameSection, ResponsiveCard } from "@/components/ResponsiveGameLayout";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useResponsiveLayout } from "@/hooks/useViewport";

import { 
  DYNAMICS_MODES, 
  getModeById, 
  getMaxDifficultyForMode,
  GameMode 
} from "../lib/gameLogic/dynamics-001Modes";
import { audioService } from "../lib/audioService";
import { 
  GameRound, 
  generateRound, 
  validateAnswer, 
  calculateScore, 
  updateProgress, 
  getNextDifficulty,
  GameProgress,
  getAudioParameters,
  getScoreBreakdown,
  ScoreBreakdown
} from "../lib/gameLogic/dynamics-001Logic";

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
  achievements: string[];
  scoreBreakdown: ScoreBreakdown | null;
}

const Dynamics001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const layout = useResponsiveLayout();
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
    achievements: [],
    scoreBreakdown: null
  });

  const decorativeOrbs = useMemo(() => generateDecorativeOrbs(), []);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('dynamics-001-progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setGameState(prev => ({
          ...prev,
          gameProgress: parsed.gameProgress || {},
          totalScore: parsed.totalScore || 0,
          achievements: parsed.achievements || []
        }));
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    const progressData = {
      gameProgress: gameState.gameProgress,
      totalScore: gameState.totalScore,
      achievements: gameState.achievements
    };
    localStorage.setItem('dynamics-001-progress', JSON.stringify(progressData));
  }, [gameState.gameProgress, gameState.totalScore, gameState.achievements]);

  // Save progress whenever it changes
  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  // Audio synthesis functions
  const playTone = useCallback((frequency: number, duration: number, volume: number, articulation?: string) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const masterVolume = gameState.volume / 100;
    const actualVolume = volume * masterVolume * 0.3;

    // Apply articulation
    const now = audioContextRef.current.currentTime;
    
    if (articulation === 'staccato') {
      // Short, detached, light
      duration *= 0.2; 
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    } 
    else if (articulation === 'legato') {
      // Smooth, connected, full value
      // Gentle attack and release
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume, now + 0.1);
      gainNode.gain.setValueAtTime(actualVolume, now + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    } 
    else if (articulation === 'accent') {
      // Sharp attack, normal length
      // Strong initial burst
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume * 1.5, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(actualVolume, now + 0.1);
      gainNode.gain.setValueAtTime(actualVolume, now + duration - 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    } 
    else if (articulation === 'marcato') {
      // "Marked" - Loud, strong attack, detached (shorter than accent)
      // Like a heavy staccato or short accent
      duration *= 0.6;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume * 1.8, now + 0.02); // Very strong attack
      gainNode.gain.exponentialRampToValueAtTime(actualVolume * 0.8, now + 0.15); // Quick decay
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    }
    else if (articulation === 'tenuto') {
      // "Held" - Full duration, heavy, deliberate
      // Slighting loudness boost, very consistent sustain
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume * 1.1, now + 0.05);
      gainNode.gain.setValueAtTime(actualVolume * 1.1, now + duration - 0.02); // Hold full volume until end
      gainNode.gain.linearRampToValueAtTime(0, now + duration); // Quick cut-off
    }
    else {
      // Normal
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(actualVolume, now + 0.02);
      gainNode.gain.setValueAtTime(actualVolume, now + duration - 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [gameState.volume]);

  const playAudioForRound = useCallback(async (round: GameRound) => {
    if (!audioContextRef.current || gameState.isPlaying) return;

    setGameState(prev => ({ ...prev, isPlaying: true }));

    const parameters = getAudioParameters(round.audioConfig);
    const noteDelay = 500; // Time between notes in ms

    if (round.audioConfig.type === 'comparison') {
      // Play first phrase
      parameters.forEach((param, index) => {
        setTimeout(() => {
          playTone(param.frequency, 0.4, param.volume, param.articulation);
        }, index * noteDelay);
      });

      // Wait, then play second phrase
      const secondPhraseDelay = (parameters.length * noteDelay) + 1000;
      
      setTimeout(() => {
        if (round.audioConfig.volume2 !== undefined) {
          const notes = round.audioConfig.notes || [440];
          notes.forEach((note, index) => {
            setTimeout(() => {
              playTone(note, 0.4, round.audioConfig.volume2!, round.audioConfig.articulation);
            }, index * noteDelay);
          });
        }
      }, secondPhraseDelay);

      setTimeout(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
      }, secondPhraseDelay + (parameters.length * noteDelay) + 500);

    } else {
      // Single, Articulation, or Progression
      // Now handled uniformly thanks to getAudioParameters returning discrete notes for progression
      parameters.forEach((param, index) => {
        setTimeout(() => {
          // Use a reasonable duration for each note (0.4s) unless specified otherwise in param
          // For progression, getAudioParameters passes the 'duration' from config which was 2.0s (too long)
          // So we override or be smart. Let's use 0.4s for melody notes.
          const duration = round.audioConfig.type === 'articulation' ? param.duration : 0.4;
          playTone(param.frequency, duration, param.volume, param.articulation);
        }, index * noteDelay);
      });

      setTimeout(() => {
        setGameState(prev => ({ ...prev, isPlaying: false }));
      }, (parameters.length * noteDelay) + 500);
    }
  }, [gameState.isPlaying, playTone]);

  // Generate new round
  // Removed useEffect trigger to prevent auto-advance on score update
  
  // Handle mode selection
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

  // Handle answer selection
  const selectAnswer = useCallback((answerIndex: number) => {
    if (gameState.isAnswered || !gameState.currentRound) return;

    const timeSpent = Date.now() - gameState.startTime;
    const isCorrect = validateAnswer(answerIndex, gameState.currentRound.correctAnswer);
    const scoreBreakdown = getScoreBreakdown(isCorrect, timeSpent, gameState.currentRound.difficulty);
    const roundScore = scoreBreakdown.total;

    // Play feedback sound
    if (isCorrect) {
      audioService.playSuccessTone();
    } else {
      audioService.playErrorTone();
    }

    setGameState(prev => {
      const newProgress = { ...prev.gameProgress };
      const modeId = prev.currentMode!.id;
      
      if (!newProgress[modeId]) {
        newProgress[modeId] = {
          mode: modeId,
          score: 0,
          roundsCompleted: 0,
          currentDifficulty: 1,
          correctAnswers: 0,
          totalAnswers: 0,
          averageTime: 0,
          bestScore: 0
        };
      }

      const updatedProgress = updateProgress(newProgress[modeId], {
        correct: isCorrect,
        timeSpent,
        score: roundScore
      });

      const maxDifficulty = getMaxDifficultyForMode(modeId);
      updatedProgress.currentDifficulty = getNextDifficulty(
        updatedProgress.currentDifficulty,
        updatedProgress,
        maxDifficulty
      );

      newProgress[modeId] = updatedProgress;

      return {
        ...prev,
        selectedAnswer: answerIndex,
        isAnswered: true,
        score: prev.score + roundScore,
        totalScore: prev.totalScore + roundScore,
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
      // Game completed for this mode
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
      const difficulty = gameState.gameProgress[gameState.currentMode!.id]?.currentDifficulty || 1;
      const newRound = generateRound(gameState.currentMode!.id, difficulty);

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

  // Memoized mode progress for performance
  const modeProgress = useMemo(() => {
    if (!gameState.currentMode) return null;
    return gameState.gameProgress[gameState.currentMode.id] || null;
  }, [gameState.currentMode, gameState.gameProgress]);

  // --- Render: Mode Selection Screen ---
  if (gameState.showModeSelection) {
    return (
      <ResponsiveGameLayout showDecorations={false}>
        {/* Decorative Background */}
        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <GameSection variant="header">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center justify-between w-full max-w-6xl">
               <Button
                onClick={() => setLocation('/games')}
                variant="outline"
                className={`${playfulShapes.rounded.button} gap-2 border-2 border-purple-300 text-purple-700 hover:bg-purple-50`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Games
              </Button>

              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 shadow-sm">
                {gameState.volume > 0 ? (
                  <Volume2 className="w-5 h-5 text-purple-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameState.volume}
                  onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                  className="w-24 accent-purple-500"
                  aria-label="Volume control"
                />
              </div>
            </div>

            <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
                Dynamics Master
              </h1>
              <p className={`${playfulTypography.body.large} text-gray-600 dark:text-gray-300`}>
                Master musical expression through dynamics and articulation!
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
            {DYNAMICS_MODES.map((mode, index) => {
              const progress = gameState.gameProgress[mode.id];
              const completion = progress ? (progress.correctAnswers / Math.max(progress.totalAnswers, 1)) * 100 : 0;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                  className={`
                    relative group text-left
                    ${playfulShapes.rounded.card}
                    bg-white dark:bg-gray-800
                    border-4 border-transparent hover:border-purple-300 dark:hover:border-purple-700
                    shadow-xl hover:shadow-2xl
                    transform hover:-translate-y-1
                    transition-all duration-300
                    p-6 flex flex-col gap-4
                    overflow-hidden
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon Background */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-2xl group-hover:bg-purple-100 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300 origin-left">
                      {mode.icon}
                    </div>
                    
                    <h3 className={`${playfulTypography.headings.h3} text-gray-800 dark:text-gray-100 group-hover:text-purple-600 transition-colors`}>
                      {mode.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[3rem]">
                      {mode.description}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3 relative z-10">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span>{mode.ageRange}</span>
                      <span className={`px-2 py-1 rounded ${
                        mode.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        mode.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {mode.difficulty.charAt(0).toUpperCase() + mode.difficulty.slice(1)}
                      </span>
                    </div>

                    {progress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                          <span>Mastery</span>
                          <span>{Math.round(completion)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              completion >= 80 ? 'bg-green-500' :
                              completion >= 50 ? 'bg-yellow-500' :
                              'bg-purple-500'
                            }`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-yellow-600 font-medium mt-1">
                          <Star className="w-3 h-3 fill-current" />
                          Best: {progress.bestScore}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </GameSection>
        
        {gameState.achievements.length > 0 && (
          <GameSection variant="footer">
             <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 max-w-4xl mx-auto w-full border-2 border-yellow-200">
              <h2 className={`${playfulTypography.headings.h4} text-yellow-700 flex items-center gap-2 mb-4`}>
                <Trophy className="w-6 h-6" />
                Your Achievements
              </h2>
              <div className="flex flex-wrap gap-2">
                {gameState.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-bold border border-yellow-200 shadow-sm animate-in zoom-in duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    🏆 {achievement}
                  </span>
                ))}
              </div>
            </div>
          </GameSection>
        )}
      </ResponsiveGameLayout>
    );
  }

  // --- Render: Active Game ---
  if (!gameState.currentMode || !gameState.currentRound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-purple-600">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-lg">Loading Game...</p>
      </div>
    );
  }

  const currentMode = gameState.currentMode;
  const progress = modeProgress;

  return (
    <ResponsiveGameLayout showDecorations={true}>
      {/* Decorative Orbs */}
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <GameSection variant="header">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
          {/* Top Bar */}
          <div className="flex flex-col gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-purple-100">
            <div className="flex items-center justify-between">
              <Button
                onClick={backToModeSelection}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-purple-50 hover:text-purple-700 gap-2 -ml-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Modes
              </Button>

              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                <span className="text-2xl">{currentMode.icon}</span>
                <span className="font-bold text-purple-900">{currentMode.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                 {gameState.volume > 0 ? <Volume2 className="w-4 h-4 text-gray-400"/> : <VolumeX className="w-4 h-4 text-gray-400"/>}
                 <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameState.volume}
                  onChange={(e) => setGameState(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                  className="w-20 accent-purple-500"
                />
              </div>
            </div>

            {/* Progress & Score Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                  <span>Round {gameState.round} of {currentMode.maxRounds}</span>
                  <span className="text-purple-600">{Math.round((gameState.round / currentMode.maxRounds) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(gameState.round / currentMode.maxRounds) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full font-bold border border-yellow-200 shadow-sm whitespace-nowrap">
                Score: {gameState.score}
              </div>
            </div>
          </div>
        </div>
      </GameSection>

      <GameSection variant="main" fillSpace>
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-full gap-8 py-4">
          
          {/* Audio Player Card */}
          <div className="text-center w-full">
            <h3 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-white mb-8 drop-shadow-sm`}>
              {gameState.currentRound.question}
            </h3>
            
            <div className="flex justify-center mb-8">
              <Button
                onClick={() => playAudioForRound(gameState.currentRound!)}
                disabled={gameState.isPlaying}
                className={`
                  relative
                  w-32 h-32 rounded-full
                  flex flex-col items-center justify-center gap-2
                  transition-all duration-300
                  ${gameState.isPlaying 
                    ? 'bg-gray-100 text-gray-400 scale-95 ring-4 ring-gray-200' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 ring-4 ring-purple-200 hover:ring-purple-300'
                  }
                `}
              >
                {gameState.isPlaying ? (
                  <>
                    <span className="absolute inset-0 rounded-full animate-ping bg-purple-400 opacity-20"></span>
                    <Music2 className="w-10 h-10 animate-bounce" />
                    <span className="text-xs font-bold">Playing...</span>
                  </>
                ) : (
                  <>
                     <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity" />
                     <Play className="w-12 h-12 fill-current ml-1" />
                     <span className="text-xs font-bold">Listen</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4">
            {gameState.currentRound.options.map((option, index) => {
              const isCorrect = index === gameState.currentRound!.correctAnswer;
              const isSelected = index === gameState.selectedAnswer;
              const showResult = gameState.isAnswered;

              let cardStyle = "bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50 shadow-sm hover:shadow-md";
              let icon = <div className="w-6 h-6 rounded-full border-2 border-gray-300" />; // Empty radio

              if (showResult) {
                if (isCorrect) {
                  cardStyle = "bg-green-50 border-green-500 ring-2 ring-green-200 shadow-md";
                  icon = <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"><Sparkles className="w-3.5 h-3.5" /></div>;
                } else if (isSelected) {
                  cardStyle = "bg-red-50 border-red-500 ring-2 ring-red-200 shadow-md";
                  icon = <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white"><VolumeX className="w-3.5 h-3.5" /></div>;
                } else {
                  cardStyle = "bg-gray-50 border-gray-200 opacity-50 grayscale";
                }
              } else if (isSelected) {
                 cardStyle = "bg-purple-50 border-purple-500 ring-2 ring-purple-200";
                 icon = <div className="w-6 h-6 rounded-full border-4 border-purple-500" />;
              }

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={gameState.isAnswered}
                  className={`
                    relative
                    p-6 rounded-xl border-2 text-left transition-all duration-200
                    flex items-center justify-between gap-4
                    group
                    ${cardStyle}
                    ${gameState.isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}
                  `}
                >
                  <span className={`text-lg font-semibold ${showResult && isCorrect ? 'text-green-800' : 'text-gray-700'} group-hover:text-purple-900`}>
                    {option}
                  </span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Result Feedback */}
          {gameState.isAnswered && (
            <div className="w-full">
              <div className={`
                rounded-2xl p-6 text-center shadow-lg border-2
                ${gameState.selectedAnswer === gameState.currentRound.correctAnswer 
                  ? 'bg-green-100 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
                }
              `}>
                <div className="mb-4">
                  {gameState.selectedAnswer === gameState.currentRound.correctAnswer ? (
                    <h3 className="text-2xl font-bold text-green-700 mb-2 flex items-center justify-center gap-2">
                      <Sparkles className="w-6 h-6" /> Correct!
                    </h3>
                  ) : (
                    <h3 className="text-2xl font-bold text-red-700 mb-2 flex items-center justify-center gap-2">
                       Incorrect
                    </h3>
                  )}
                  
                  <p className="text-lg font-medium">
                    {gameState.currentRound.explanation}
                  </p>
                </div>

                {gameState.scoreBreakdown && gameState.scoreBreakdown.total > 0 && (
                  <div className="mb-6 bg-white/60 rounded-xl p-4 max-w-sm mx-auto">
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                      <div className="text-left text-gray-600">Base Score:</div>
                      <div className="text-right font-bold">{gameState.scoreBreakdown.baseScore}</div>
                      
                      <div className="text-left text-gray-600">Difficulty:</div>
                      <div className="text-right font-bold text-purple-600">x{gameState.scoreBreakdown.difficultyMultiplier}</div>
                      
                      <div className="col-span-2 border-t border-gray-300/50 my-2"></div>
                      
                      <div className="text-left font-bold text-gray-800 text-base">Round Score:</div>
                      <div className="text-right font-bold text-xl text-purple-700">+{gameState.scoreBreakdown.total}</div>
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={nextRound}
                  size="lg"
                  className={`
                    ${playfulShapes.rounded.button}
                    bg-white hover:bg-gray-50 text-gray-900
                    shadow-md hover:shadow-lg
                    border-2 border-current
                    px-8 text-lg
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

export default Dynamics001Game;
