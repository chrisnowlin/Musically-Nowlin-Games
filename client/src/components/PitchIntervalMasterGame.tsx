import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Trophy, Target, Zap, ChevronLeft } from 'lucide-react';
import {
  Pitch001Game,
  Pitch001Round,
  Pitch001GameState,
  createPitch001Game,
  getPitch001ModeConfig
} from '@/lib/gameLogic/pitch-001Logic';
import { pitch001Modes } from '@/lib/gameLogic/pitch-001Modes';
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from '@/theme/playful';
import { useAudioService } from '@/hooks/useAudioService';
import { useGameCleanup } from '@/hooks/useGameCleanup';
import AudioErrorFallback from '@/components/AudioErrorFallback';

interface PitchIntervalMasterGameProps {
  modeId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onGameComplete: (score: number, totalRounds: number) => void;
  onBackToMenu: () => void;
}

export const PitchIntervalMasterGame: React.FC<PitchIntervalMasterGameProps> = ({
  modeId,
  difficulty,
  onGameComplete,
  onBackToMenu
}) => {
  const [game, setGame] = useState<Pitch001Game | null>(null);
  const [gameState, setGameState] = useState<Pitch001GameState>({
    currentRound: null,
    score: 0,
    roundNumber: 0,
    totalRounds: 10,
    isPlaying: false,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    streak: 0,
    bestStreak: 0
  });
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout } = useGameCleanup();

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

  const modeConfig = getPitch001ModeConfig(modeId);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      return () => {
        ctx.close();
      };
    }
  }, []);

  useEffect(() => {
    if (modeId && difficulty) {
      const newGame = createPitch001Game(modeId, difficulty);
      setGame(newGame);
    }
  }, [modeId, difficulty]);

  const playAudio = useCallback(async (audioData: any) => {
    if (!audioContext || isMuted) return;

    try {
      setIsPlaying(true);
      
      switch (audioData.type) {
        case 'two-notes':
        case 'interval':
        case 'reference-and-target':
          await playTwoNotes(audioData.frequencies, audioData.duration);
          break;
        case 'pitch-bend':
          await playPitchBend(audioData.frequencies[0], audioData.parameters);
          break;
        case 'vibrato':
          await playVibrato(audioData.frequencies[0], audioData.parameters);
          break;
        case 'glissando':
          await playGlissando(audioData.frequencies, audioData.parameters);
          break;
        case 'portamento':
          await playPortamento(audioData.frequencies, audioData.parameters);
          break;
        case 'envelope':
          await playEnvelope(audioData.frequencies[0], audioData.parameters);
          break;
        case 'harmonics':
          await playHarmonics(audioData.frequencies, audioData.parameters);
          break;
        case 'relative-pitch':
        case 'absolute-pitch':
          await playTwoNotes(audioData.frequencies, audioData.duration);
          break;
        default:
          await playSimpleTone(audioData.frequencies[0], audioData.duration);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [audioContext, isMuted]);

  const playSimpleTone = async (frequency: number, duration: number): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume * 0.3;
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playTwoNotes = async (frequencies: number[], duration: number): Promise<void> => {
    if (!audioContext) return;

    for (const frequency of frequencies) {
      await playSimpleTone(frequency, duration);
      await new Promise(resolve => setGameTimeout(resolve, 200));
    }
  };

  const playPitchBend = async (frequency: number, params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume * 0.3;
    
    const now = audioContext.currentTime;
    const bendAmount = params.bendAmount;
    const bendDirection = params.bendDirection;
    
    if (bendDirection === 'up') {
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * Math.pow(2, bendAmount / 12),
        now + 1.0
      );
    } else {
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency / Math.pow(2, bendAmount / 12),
        now + 1.0
      );
    }
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    oscillator.start(now);
    oscillator.stop(now + 1.0);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playVibrato = async (frequency: number, params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    lfo.frequency.value = params.rate;
    lfoGain.gain.value = params.hasVibrato ? frequency * params.depth : 0;
    
    gainNode.gain.value = volume * 0.3;
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2.0);
    
    oscillator.start();
    lfo.start();
    oscillator.stop(audioContext.currentTime + 2.0);
    lfo.stop(audioContext.currentTime + 2.0);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playGlissando = async (frequencies: number[], params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[0];
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume * 0.3;
    
    const now = audioContext.currentTime;
    const duration = params.speed === 'slow' ? 2.0 : params.speed === 'medium' ? 1.0 : 0.5;
    
    oscillator.frequency.linearRampToValueAtTime(frequencies[1], now + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playPortamento = async (frequencies: number[], params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[0];
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume * 0.3;
    
    const now = audioContext.currentTime;
    
    if (params.hasPortamento) {
      oscillator.frequency.linearRampToValueAtTime(
        frequencies[1],
        now + params.portamentoTime
      );
    } else {
      oscillator.frequency.setValueAtTime(frequencies[1], now + 0.1);
    }
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    oscillator.start(now);
    oscillator.stop(now + 1.0);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playEnvelope = async (frequency: number, params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = params.envelopeType === 'sawtooth' ? 'sawtooth' : 'sine';
    
    const now = audioContext.currentTime;
    const { attackTime, decayTime, sustainLevel, releaseTime } = params;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3 * sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(volume * 0.3 * sustainLevel, now + 1.5);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + releaseTime);
    
    oscillator.start(now);
    oscillator.stop(now + 1.5 + releaseTime);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playHarmonics = async (frequencies: number[], params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillators: OscillatorNode[] = [];
    const gainNode = audioContext.createGain();
    
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = volume * 0.2;
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      oscillator.connect(oscGain);
      oscGain.connect(gainNode);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      oscGain.gain.value = 1 / (index + 1); // Decrease amplitude for higher harmonics
      
      oscillators.push(oscillator);
      oscillator.start();
    });
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);

    return new Promise(resolve => {
      setGameTimeout(() => {
        oscillators.forEach(osc => osc.stop());
        resolve();
      }, 1500);
    });
  };

  const startGame = async () => {
    await initialize();
    setGameStarted(true);
    nextRound();
  };

  const nextRound = () => {
    if (!game) return;

    const newRound = game.generateRound();
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      roundNumber: prev.roundNumber + 1,
      selectedAnswer: null,
      showResult: false,
      isCorrect: false,
      isPlaying: true
    }));

    // Auto-play audio for new round
    setGameTimeout(() => {
      if (newRound.audioData) {
        playAudio(newRound.audioData);
      }
    }, 500);
  };

  const handleAnswerSelect = (answer: string) => {
    if (!gameState.currentRound || gameState.showResult) return;

    const isCorrect = game!.validateAnswer(answer, gameState.currentRound.answer);
    const points = isCorrect ? gameState.currentRound.points : 0;
    
    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showResult: true,
      isCorrect,
      score: prev.score + points,
      streak: isCorrect ? prev.streak + 1 : 0,
      bestStreak: Math.max(prev.bestStreak, isCorrect ? prev.streak + 1 : prev.bestStreak)
    }));
  };

  const handleNextRound = () => {
    if (gameState.roundNumber >= gameState.totalRounds) {
      endGame();
    } else {
      nextRound();
    }
  };

  const endGame = () => {
    onGameComplete(gameState.score, gameState.totalRounds);
  };

  const resetGame = () => {
    setGameState({
      currentRound: null,
      score: 0,
      roundNumber: 0,
      totalRounds: 10,
      isPlaying: false,
      selectedAnswer: null,
      showResult: false,
      isCorrect: false,
      streak: 0,
      bestStreak: 0
    });
    setGameStarted(false);
  };

  if (!modeConfig) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <div className={`${playfulComponents.card.base} ${playfulComponents.card.available} w-full max-w-2xl`}>
          <div className="p-8 text-center">
            <p className={`${playfulTypography.body.large} text-gray-600 dark:text-gray-400`}>Mode not found</p>
            <Button 
              onClick={onBackToMenu} 
              className={`${playfulComponents.button.primary} mt-4 transform ${playfulAnimations.hover.scale}`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    const decorativeOrbs = generateDecorativeOrbs();
    
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full">
          <div className={`${playfulComponents.card.base} ${playfulComponents.card.available} w-full max-w-2xl`}>
            <div className="text-center p-8 space-y-6">
              <div className="space-y-4">
                <div className={`${playfulComponents.iconContainer.large} ${playfulColors.accents.purple.bg} mx-auto w-24 h-24`}>
                  <span className="text-5xl">{modeConfig.icon}</span>
                </div>
                <h2 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-gray-200`}>
                  {modeConfig.name}
                </h2>
                <span className={playfulComponents.badge.purple}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
                  {modeConfig.description}
                </p>
                <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-orange-600" />
                    <span className={playfulTypography.headings.h4}>How to Play:</span>
                  </div>
                  <p className={`${playfulTypography.body.medium} text-gray-600 dark:text-gray-400`}>
                    {modeConfig.instructions[difficulty]}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-around bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <span className={`${playfulTypography.body.medium} text-gray-700 dark:text-gray-300`}>10 Rounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span className={`${playfulTypography.body.medium} text-gray-700 dark:text-gray-300`}>
                    {difficulty === 'easy' ? '10' : difficulty === 'medium' ? '20' : '30'} points each
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={startGame} 
                  className={`${playfulComponents.button.success} flex-1 transform ${playfulAnimations.hover.scale}`}
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Game
                </Button>
                <Button 
                  onClick={onBackToMenu} 
                  className={`${playfulComponents.button.secondary} transform ${playfulAnimations.hover.scale}`}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const decorativeOrbs = generateDecorativeOrbs();
  
  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} ${playfulShapes.shadows.card} p-6 w-full max-w-4xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`${playfulComponents.iconContainer.medium} ${playfulColors.accents.purple.bg}`}>
                <span className="text-2xl">{modeConfig.icon}</span>
              </div>
              <div>
                <h2 className={`${playfulTypography.headings.h3} text-gray-800 dark:text-gray-200`}>
                  {modeConfig.name}
                </h2>
                <p className={`${playfulTypography.body.small} text-gray-600 dark:text-gray-400`}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={playfulComponents.badge.purple}>
                Round {gameState.roundNumber}/{gameState.totalRounds}
              </span>
              <span className={playfulComponents.badge.green}>
                Score: {gameState.score}
              </span>
              {gameState.streak > 0 && (
                <span className={`${playfulComponents.badge.orange} flex items-center gap-1`}>
                  <Zap className="h-3 w-3" />
                  {gameState.streak} Streak
                </span>
              )}
            </div>
          </div>
          <Progress 
            value={(gameState.roundNumber / gameState.totalRounds) * 100} 
            className="h-3 w-full"
          />
        </div>

        {gameState.currentRound && (
          <div className={`${playfulComponents.card.base} ${playfulComponents.card.available} w-full max-w-4xl`}>
            <div className="p-8 space-y-8">
              <div className="text-center space-y-6">
                <h3 className={`${playfulTypography.headings.h3} text-gray-800 dark:text-gray-200`}>
                  {gameState.currentRound.question}
                </h3>
                
                {/* Audio Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => playAudio(gameState.currentRound!.audioData)}
                    disabled={isPlaying}
                    className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
                    size="lg"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 mr-2" />
                    ) : (
                      <Play className="h-5 w-5 mr-2" />
                    )}
                    {isPlaying ? 'Playing...' : 'Play Sound'}
                  </Button>
                  
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`${playfulComponents.button.secondary} transform ${playfulAnimations.hover.scale}`}
                    size="sm"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {gameState.currentRound.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={gameState.showResult}
                      className={`h-16 text-lg transform ${playfulAnimations.hover.scale} ${
                        gameState.showResult
                          ? option === gameState.currentRound!.answer
                            ? playfulComponents.button.success
                            : option === gameState.selectedAnswer
                            ? playfulComponents.button.error
                            : playfulComponents.button.secondary
                          : playfulComponents.button.secondary
                      }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {/* Result Display */}
                {gameState.showResult && (
                  <div className="space-y-6 animate-fade-in">
                    <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${
                      gameState.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {gameState.isCorrect ? (
                        <>
                          <Trophy className="h-8 w-8" />
                          Correct!
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-8 w-8" />
                          Try Again!
                        </>
                      )}
                    </div>
                    
                    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${playfulShapes.rounded.container} p-6 ${playfulShapes.shadows.card}`}>
                      <p className={`${playfulTypography.body.medium} text-gray-700 dark:text-gray-300`}>
                        {gameState.currentRound.explanation}
                      </p>
                    </div>

                    <Button 
                      onClick={handleNextRound}
                      className={`${playfulComponents.button.success} transform ${playfulAnimations.hover.scale}`}
                      size="lg"
                    >
                      {gameState.roundNumber >= gameState.totalRounds ? 'Finish Game' : 'Next Round'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="flex justify-between gap-4 w-full max-w-4xl">
          <Button 
            onClick={resetGame} 
            className={`${playfulComponents.button.secondary} transform ${playfulAnimations.hover.scale}`}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Game
          </Button>
          <Button 
            onClick={onBackToMenu} 
            className={`${playfulComponents.button.secondary} transform ${playfulAnimations.hover.scale}`}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
};